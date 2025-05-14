// @ts-check
import { test } from '../Helper/base.ts';

test.beforeEach(async ({ context }) => {
    await context.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());
});


test('Verify that all images with srcset attributes have accessible image URLs', async ({ blogsPage, blogPage}) => {
    const BlogsURLset = new Set();
    await test.step('Open blogs page and get blogs urls', async step => {
      await blogsPage.goto(); // Navigate to /blog/tags/latest
      const BlogLinks = await blogsPage.getBlogsLinks(); // get all blogs links 
      BlogLinks.forEach(href => BlogsURLset.add(href)); // filter links to have only unique links
    });

    for(let BlogURL of BlogsURLset){
      await test.step(`Check images on ${BlogURL}`, async () => {
        await blogPage.goto(BlogURL); // Visit Blog
        const imagesUrls = await blogPage.getAllImagesUrl();// Get all pictures from blog, and filter it
        const responses = await blogPage.getImagesResult(imagesUrls);//Make a requests and save it into object {image link, status (200,403, etc...)}

        //Check if all responses was success (200)
        for (const { src, status } of responses) {
          blogPage.expectSuccess(status,`Image status code ${status} for: ${src} on page ${BlogURL}`);
        }
      });
    }
});