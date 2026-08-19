import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Log all console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        
        print("Navigating to http://localhost:8080...")
        try:
            # Increase timeout and wait for network idle to ensure everything loaded
            await page.goto("http://localhost:8080", wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Check visibility of main components
        header_visible = await page.is_visible("header")
        footer_visible = await page.is_visible("footer")
        main_visible = await page.is_visible("main")
        
        print(f"Header visible: {header_visible}")
        print(f"Footer visible: {footer_visible}")
        print(f"Main visible: {main_visible}")

        # Take a screenshot to see what's actually rendered
        await page.screenshot(path="screenshot.png")
        print("Screenshot saved to screenshot.png")
        
        # Check computed styles of body and root
        body_styles = await page.evaluate("""() => {
            const body = document.body;
            return {
                display: getComputedStyle(body).display,
                visibility: getComputedStyle(body).visibility,
                opacity: getComputedStyle(body).opacity,
                height: body.offsetHeight,
                width: body.offsetWidth
            };
        }""")
        print(f"Body styles: {body_styles}")

        await browser.close()

asyncio.run(main())
