import asyncio
import json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Log all console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        
        # Log failed requests
        page.on("requestfailed", lambda req: print(f"FAILED: {req.method} {req.url} - {req.failure.error_text}"))

        print("Navigating to http://localhost:8080...")
        try:
            await page.goto("http://localhost:8080", wait_until="networkidle", timeout=10000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Check for root element
        root_exists = await page.evaluate("!!document.querySelector('body').innerHTML.trim()")
        print(f"Body content exists: {root_exists}")
        
        # Get body HTML if blank
        if not root_exists:
            html = await page.content()
            print("Full Page HTML:")
            print(html)
        
        await browser.close()

asyncio.run(main())
