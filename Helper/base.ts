import {test as baseTest} from '@playwright/test';
import {BlogsPage, BlogPage } from './pom';


type MyFixtures = {
    blogsPage: BlogsPage;
    blogPage: BlogPage;
}

export const test = baseTest.extend<MyFixtures>({
    blogsPage: async ({page}, use) => {
        await use(new BlogsPage(page));
    },
    blogPage: async ({page,request}, use) => {
        await use(new BlogPage(page,request));
    },
});

export {expect} from '@playwright/test';