// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
    await context.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());
});


test('Images loading check', async ({ page, request}) => {
    const BlogsURLset = new Set();
    await test.step('Open blogs page and get blogs urls', async step => {
      await page.goto('/blog/tags/latest');

      const links = await page.locator('a[href^="/blog/"]').evaluateAll(links =>
        links
        .map(link => link.getAttribute('href'))
        .filter(href => href && !href.includes('/tags/'))
      ); // Get all blogs links

      links.forEach(href => BlogsURLset.add(href)); // filter links to have only unique links
    });

    for(let url of BlogsURLset){
      await test.step(`Check images on ${url}`, async () => {
        await page.goto(url);

        //Get all images srcsets
        const srcsets = await page.locator('//picture/source[@srcset]').evaluateAll(sources =>
          sources.map(source => source.getAttribute('srcset'))
        );

        //Filter images to array split from 3x,2x, spaces and ,
        const imageUrls = srcsets.flatMap(srcset =>
          srcset ? srcset.split(',').map(part => part.trim().split(' ')[0]) : []
        );


        //Make sure that urls are unique
        const uniqueImageUrls = [...new Set(imageUrls)];

        //Make a requests and save it into object {image link, status (200,403, etc...)}
        const responses = await Promise.all(
          uniqueImageUrls.map(src => request.get(src)
          .then(res => ({ 
              src, 
              status: res.status() 
            }))
        ));

        //Check if all responses was success (200)
        for (const { src, status } of responses) {
          expect.soft(status, `Image status code ${status} for: ${src} on page ${url}`).toBe(200);
        }
      });
    }
});