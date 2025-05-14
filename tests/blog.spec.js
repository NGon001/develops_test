// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
    await context.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());
});


test('Images loading check', async ({ page, request}) => {
    const BlogsURLset = new Set();
    await test.step('Open blogs page and get blogs urls', async step => {
      await page.goto('/blog/tags/latest');
      const links = await page.locator('a[href^="/blog/"]').all(); // all links (a) with href (a[href]) and starts with /blog/  (a[href^="/blog/"])
      for (const link of links) {
          const href = await link.getAttribute('href');
          if (href && !href.includes('/tags/')) {
            BlogsURLset.add(href);
          }
      }
    });

    for(let url of BlogsURLset){
      await test.step(`Check images on ${url}`, async () => {
        await page.goto(url);

        const srcsets = await page.locator('//picture/source[@srcset]').evaluateAll(sources =>
          sources.map(source => source.getAttribute('srcset'))
        );

        const imageUrls = srcsets.flatMap(srcset =>
          srcset ? srcset.split(',').map(part => part.trim().split(' ')[0]) : []
        );

        const uniqueImageUrls = [...new Set(imageUrls)];

        const responses = await Promise.all(
          uniqueImageUrls.map(src => request.get(src)
          .then(res => ({ 
              src, 
              status: res.status() 
            }))
        ));

        for (const { src, status } of responses) {
          expect.soft(status, `Image status code ${status} for: ${src} on page ${url}`).toBe(200);
        }
      });
    }
});