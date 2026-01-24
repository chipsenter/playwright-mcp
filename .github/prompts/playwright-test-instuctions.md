---
mode: agent 
description: "Manually test a site and create a report"
tools: ['chages', 'search/codebase', edit/editFiles, 'fetch', 'openSimpleBrowser', 'problems', 'runCommands', 'runTasks', 'runTests', 'search', 'search/searchResults', 'runCommands/terminalLastCommand', 'runCommands/terminalSelection', 'testFailure', 'testResults', 'microsoft/playwright-mcp/*', 'gitCommands', 'reRunCommands']
model: 'Claude Sonnet 4.5'
---

# Manual Testing Instructions
1.Use Playwright MCP server to navigate to the website , take a page snapshot and analyze the key functionalities. Then manually test the scenario provided by the user . if no scenario is provided , ask the user to provide one. Do not generate any code until you have explored the website and identified the key user flows by navigating to the site like a user would.
2. Navigate to the url provided by the user and perform the described interactions. If no url is provided, ask the user to provide one.
3. Observe and verify the expected behavior, focusing on accessibility, UI structure, and user experience. 
3.1 - Observe and track network calls , slow responses , endpoints not returning in < 1000ms or other unexpected front end behaviors.
4. Report back in clear , natural language: 
    - What steps your performed (navigation, interactions, assertions).
    - What you observed (outcomes, UI changes, accessibility results).
    - Any issues, unexpected behaviors , or accessibility concerns found.
5. Reference URLs, element roles , and relevant details to support your findings. 

Example report format: 
- **Scenario:** [Brief description]
- **Steps Taken:** [List of actions performed]
- **Outcome:** [List any problems or unexpected results]

Generate a new .md file with matching name and date, the report should be created in the `manual-test-cases` directory and include any relevant screenshots or snapshots.

Take screenshots or snapshots of the page if necessary to illustrate issues or confirm expected behavior.

close the browser after the manual test. 