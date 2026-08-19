import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Checking API endpoint http://localhost:8080/api/public/deployment-check...")
        try:
            response = await page.goto("http://localhost:8080/api/public/deployment-check")
            print(f"Status: {response.status}")
            print("Response Body:")
            print(await response.text())
        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

asyncio.run(main())
