import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Log all console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        
        # Log failed requests
        page.on("requestfailed", lambda req: print(f"FAILED: {req.method} {req.url}"))

        print("Navigating to http://localhost:8080...")
        try:
            await page.goto("http://localhost:8080", wait_until="networkidle", timeout=10000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Check for root element
        html_content = await page.content()
        print("Page HTML Sample (first 1000 chars):")
        print(html_content[:1000])
        
        body_inner = await page.evaluate("document.body.innerHTML")
        print(f"Body inner HTML length: {len(body_inner.strip())}")
        if len(body_inner.strip()) < 100:
             print("Body inner HTML content:")
             print(body_inner)

        await browser.close()

asyncio.run(main())
