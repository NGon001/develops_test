import { APIRequestContext, Locator, Page, expect } from "@playwright/test";

export class BlogsPage{
    readonly url = "/blog/tags/latest";
    readonly page: Page;
    readonly links_locator: Locator;

    constructor(page: Page){
        this.page = page;
        this.links_locator = page.locator('a[href^="/blog/"]');
    }

    async goto(){
        await this.page.goto(this.url);
    }

    async getBlogsLinks(){
        return this.links_locator.evaluateAll(links =>
        links
        .map(link => link.getAttribute('href'))
        .filter(href => href && !href.includes('/tags/'))
      ); // Get all blogs links
    }
}

export class BlogPage{
    readonly page: Page;
    readonly request: APIRequestContext;
    readonly srcset_locator: Locator;

    constructor(page: Page, request: APIRequestContext){
        this.page = page;
        this.request = request;
        this.srcset_locator = page.locator('//picture/source[@srcset]');
    }

    async goto(url: string){
        await this.page.goto(url);
    }

    async getAllSrcSets(){
        return this.srcset_locator.evaluateAll(sources =>
          sources.map(source => source.getAttribute('srcset'))
        );
    }

    async getAllImagesUrl(){
        //Get all images srcsets
        const srcsets = await this.getAllSrcSets();
        //Filter images to array split from 3x,2x, spaces and ,
        const imageUrls = srcsets.flatMap(srcset =>
          srcset ? srcset.split(',').map(part => part.trim().split(' ')[0]) : []
        );
        //Make sure that urls are unique
        return [...new Set(imageUrls)];
    }

    async getImagesResult(imagesUrls){
        const responses =  await Promise.all(
          imagesUrls.map(src => this.request.get(src)
          .then(res => ({ 
              src, 
              status: res.status() 
            }))
        ));

        return responses;
    }

    async expectSuccess(status, message: string){
        expect.soft(status, message).toBe(200);
    }
}