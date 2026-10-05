# AI Prompts Log — Homework 4

A log of every prompt given to the AI assistant, grouped by part. For each prompt after the first in a part, a short note captures what the first prompt was missing.

---

## Part 1: Project Setup and Prompt Log

### Prompt 1

> we are working in the homework 4 file

### Prompt 2

> /folder-joke homework 4

**Missing from the first prompt:** It said where to work but not what to do there, so it left out a concrete task like writing a joke file.

### Prompt 3

> this is for your information, do not do anything iwth this just yet. the assignment is to create a customer website with a chatbot. the frontend will be a react & vite typeface and the backend will be python fastapi with a pydanticai agent. the website should allow people to browse products, create an account, chat about merch, and see matching items, and get honest answers about pricing and stock. Ill be giving you a database later which will provide a lot of the infomration you need.

**Missing from the first prompt:** It named the folder but left out the assignment, the tech stack (React + Vite frontend, FastAPI + PydanticAI backend), the features, and where the data would come from.

### Prompt 4

> keep luna

**Missing from the first prompt:** It didn't say which AI model to use, so this confirms `gpt-5.6-luna` through Portkey.

### Prompt 5

> alright, for part 1, I want to create a AI_prompts.md document. the purpose of this file is to log each of the prompts I give you, split into parts. I will tell you when we are moving onto the next part. give each part a number and title. For each prompt prompt after the first, write a sentence that captures what was missing from the first prompt.

**Missing from the first prompt:** It didn't ask for any record of the work, so this adds a prompt log split into numbered, titled parts, with a note on each later prompt.

---

## Part 2: Understanding the Database

### Prompt 1

> moving onto part 2

### Prompt 2

> I just added a data file into the folder. take a look at the database thats in there and understand each of the fields in each of the tables. be sure to focus on the catalogue, inventory, and users information. create an outputs folder and within that create a harness.md file. write down each table and the fields and then write a sentence about why each field will matter to the chatbot. we will continue to update this file throughout the problems.

**Missing from the first prompt:** It only announced the new part, without a task, the data source to study, the tables to focus on, or the deliverable (`outputs/harness.md`).

### Prompt 3

> create the titles for the parts on your own based on what i describe in the prompts file

**Missing from the first prompt:** It didn't name the part, so this tells the AI to write each part's title itself based on the prompts in it.

### Prompt 4

> for the harness file add in a short line about why each field is also important to the website too

**Missing from the first prompt:** It didn't say the harness should cover the website as well as the chatbot, so this adds a note on how each field is used in the site's UI.

---

## Part 3: Building the Campus Customs Website

### Prompt 1

> ok moving onto part 3

### Prompt 2

> in this part we are going to be building the campus customs website. I will tell you what to do.

**Missing from the first prompt:** It didn't say what the part was about, so this sets the goal (building the Campus Customs website) and says instructions will come step by step.

### Prompt 3

> lets pull together the scaffold of the front end. this is react + vite + typescript. put a navigation bar at the top of the website. in the bar there will be links to the main pages: home, products, about us, log-in and create account. pull from yalebulldogblue.com the wording and style of the home and about us pages. do not copy these word for word but instead follow your own voice.

**Missing from the first prompt:** It didn't name a concrete deliverable, so this sets the frontend stack (React + Vite + TypeScript), the pages in the nav bar, and yalebulldogblue.com as the style reference, rewritten in our own voice.

### Prompt 4

> for the products page, I want to show images of each product from the catalogue (use the image paths from the database) with basic product info. This should be a product card, when clicking on that card it should bring the customer to a single-item page with the image of the product on one side and key product info on the other, including a description that is written for a customer, price, stock and whatever else you think would be helpful.  I also want to add a chat interface on the bottom right of the page. this can be a floating panel. this does not yet need to be an agent instead it can be a stub that will call on your backend later. you can create a simple FastAPI app in backend/main.py to serve products and images. We will grow this later into a full agent later.

**Missing from the first prompt:** It didn't describe any features, so this adds database-driven product cards, a single-item page with customer-friendly copy, price and stock, a floating chat stub, and a FastAPI backend (`backend/main.py`) to serve products and images.

### Prompt 5

> I am unable to open the example

**Missing from the first prompt:** It didn't say how to run or open the site, so this flags that the servers had to be restarted and the correct local address shared (`http://localhost:5174`).

---

## Part 4: Login and Account Creation

### Prompt 1

> ok we are moving onto part 4

### Prompt 2

> we are going to be building the login/create account pathways. for creating an account, people need to add in first name, last name, email, password, and confirm password, add in a check box if they would like to receive promotiion emails. For logging in, it should be email and password.  New users should be added to the users table. be sure to store all passwords secretly so no hacker is able to access them. I want them secure. In the harness.md file, add in how authentification works, what info is stored for each user and how passwords are protected.

**Missing from the first prompt:** It only named the part, so this specifies the sign-up and login fields, the promo-email checkbox, saving new users to the `users` table, secure password storage, and documenting authentication in `harness.md`.

### Prompt 3

> there should be a test user, make sure that test user is included

**Missing from the first prompt:** It didn't mention a known, working test login, so this sets a documented password on the existing test account so it can actually sign in.

### Prompt 4

> the password should just be password

**Missing from the first prompt:** It didn't specify the test account's password, so this sets it to `password`.

---

## Part 5: Building the PydanticAI Agent

### Prompt 1

> great that worked. lets move onto part 5. we will be building the pydantic AI agent.

### Prompt 2

> ok, this is a pydantic ai agent behind fastapi, which will plug into our front end that we added in earlier. put the api app in backend/main.py, which we will run with uvicorn. we will keep the agent with the follow next files all in the backend folder. prompts/prompts.md this will be the system prompts. in agent.py - this will be the agent wiring. tools.py are the tools the agent can call up. models.py is the structured types. in main.py create a chat route so a message from the website eturns a reply from the agent and whatever else you need from products.

**Missing from the first prompt:** It only named the part, so this specifies the file layout (`prompts/prompts.md`, `agent.py`, `tools.py`, `models.py`, `main.py`) and that the `main.py` chat route returns the agent's reply plus the relevant products.

### Prompt 3

> great, put the campus customs voice and safety basics into prompts/prompts/md. put the start and update types into models.py for the chat and product cards as needed. and then in harness.md add the explanation about how the front end uses fastapi and how the agent is loaded (both the prompt file and model). I also want the backend to urn through the backend file like this uvicorn main:app --reload --port 8000

**Missing from the first prompt:** It set up the agent files but left out the brand voice and safety rules in the prompt, the finalized chat/product-card types, the harness explanation of the frontend↔FastAPI↔agent flow, and running the backend as `main:app` on port 8000.

---

## Part 6: Agent Tools for Product Info and Pricing

### Prompt 1

> great, we're moving onto part 6. we are going to be building tools or the agent to look up product info and pricing. do not do anything, i am just telling you.

### Prompt 2

> ok. I want to build three tools for the agent. this info should only come from the database. the tools should be looking for the product description, the price, and how many of an item are in stock (this should also tell how many items are in stock also based on size.) Do not invent any quantities or prices and should only come from the database. If a product is out of stock, I want it to say that it is out of stock and offer recommendations of another product instead. Add to the prompts/prompts.md so the agent can use those tools when asked about product or price. add or update the return types in model.py. In harness.md list the tools and explain which fields you chose to lookup and why.

**Missing from the first prompt:** It named the part but no specifics, so this defines the three database-only tools (description, price, per-size stock), the out-of-stock recommendation behavior, the prompt updates, the new return types in `models.py`, and the harness write-up of each tool's chosen fields.

---

## Part 7: Chat Search Updates the Page

### Prompt 1

> great, we are moving onto part 7. this part we are going to make it so that a chat search updates the page. I am telling you this but do not do anything with it

### Prompt 2

> ok so I want to have it that when a customer asks about a product, the agent searches the catalogue and dynamically updates the website to show the items that match as product cards. Make sure that when the products are loaded in this new feature, the single item pages that we created in part 3 for those products still show up when clicked on. update prompts/prompts/md with this feature. also update harness.md so it is clear how search results reach the page.

**Missing from the first prompt:** It named the part only, so this specifies that chat searches dynamically update the Products page with matching cards, that those cards still open the Part 3 single-item pages, and that both `prompts.md` and `harness.md` document the feature.

---

## Part 8: Customer Memory

### Prompt 1

> great moving onto part 8. We are going to be working on customer memory. I'm just telling you this dont do anything with it.

### Prompt 2

> ok I want to save the agent chat so that when a customer logs back in, their chat history comes back up. save their chat in the database in an appropriate table and return it once they log back in. the agent should know who is chatting based on their name and email. put that in either the agents deps or as a tool the agent can use. Guests (i.e those that shop without a log in) can continue to use the bot, but only those who log in does the chat history need to be saved. Also, I want it that the agent has enough page context to know what a customer is talking about based on the page they are on. You can put this in the agent context code. In harness.md outline how user chat is saved and stored, what customer fields the agent sees and uses, and how page context is given to the agent.

**Missing from the first prompt:** It named the part only, so this specifies saving logged-in chat to `chat_messages` and replaying it on return, giving the agent the customer's name and email via deps, keeping guests unsaved, feeding page context into the agent context code, and documenting all three in `harness.md`.

---

## Part 9: Frontend and Backend Improvements

### Prompt 1

> ok move onto part 9. This part we are going to make improvements to both the front and the backend. do not do anything wiht that yet

### Prompt 2

> ok for the front end I like idea 1 and 2, for the backend I like 1 and 3. Go ahead and build those out. as you are building those out add in output/usability.md what is added and why it helps the customer or business.

**Missing from the first prompt:** It asked for improvement ideas only; this one selects four (frontend cart/checkout and card actions, backend orders/inventory and email capture) to actually build and asks for `outputs/usability.md` explaining each one's customer/business value.

---

## Part 10: Website Design Improvements

### Prompt 1

> ok, we are moving onto part 10. We are going to be improving the design of the website. do nothing with that.

### Prompt 2

> ok take a look at this website. https://yalebulldogblue.com. I want you to take a look at the website design. note the elements that make this website effective in design, this include the fonts, colors, heirarchy, motion, the way products are presented, and chat feel. Just learn that information, do nothing with it just yet.

**Missing from the first prompt:** It named the part only; this points to the reference site and asks for a design study (fonts, colors, hierarchy, motion, product presentation, chat feel) before any changes.

### Prompt 3

> Are there any additional innovative or creative ways you would improve this website. these should focus on having people want to stay on the website longer and buy.

**Missing from the first prompt:** It asked to study the existing design; this asks for original engagement- and conversion-focused feature ideas beyond matching the reference.

### Prompt 4

> ok I want to apply the website changes so that our website looks more like the one I showed you. do not put in any of the innovations just yet. in output/design.md put in what you changed and why you changed it.

**Missing from the first prompt:** It gathered research and ideas; this one actually applies the visual redesign to match the reference (excluding the innovations) and asks for `outputs/design.md` recording what changed and why.

### Prompt 5

> would these recs be ones that you make you impressed?

**Missing from the first prompt:** It asked for improvement ideas; this asks for a candid quality judgment of them and a higher bar (agent-centered, genuinely innovative directions).

### Prompt 6

> ok lets do the table stakes changes that you outlined. but also lets add in a bulldog avatar for the agent with a presence.

**Missing from the first prompt:** It discussed ideas in the abstract; this selects the concrete polish set (loading skeletons, scroll-reveal, quick-view, sticky add-to-cart) to build and adds a Bulldog assistant avatar (Handsome Dan) with animated presence.

### Prompt 7

> can you make handsom dan a full bulldog sitting without a blue circle around it. I want him to be more interactive. for the home photo, can you choose a better photo. one that feels more welcoming.

**Missing from the first prompt:** The earlier avatar was a circled bust; this asks for a full seated bulldog with no circle, richer interactivity, and a warmer, more welcoming hero image.

### Prompt 8

> for the handson dan, he looks good. make him wearing a blue shirt with a white yale y in the middle. for the hero image, lets make it into a carousel of images. choose 5 images of different products that have enough stock. people should be able to click into each of the pictures and it will bring you to the single product page. Lets also add a counter on the home page for the harvard yale game and products that relate to it.

**Missing from the first prompt:** Building on the approved Dan, this dresses him in a navy Yale-"Y" shirt, turns the single hero image into a clickable 5-product carousel (well-stocked, linking to each product page), and adds a Harvard–Yale countdown plus related game-day products on the home page.

### Prompt 9

> Make the count down stand out more, and put the products all in a line with arrows that you can move through like a carousel. Also, when someone adds somehting to the cart, I want handsom dan to celebrate and then when someone places an order, I want yale colored confetti, with handsome dan wearing a party hat.

**Missing from the first prompt:** Building on the countdown and game gear, this makes the countdown a bold full-width band, turns the game products into a single-line arrow carousel (rail), adds a Handsome-Dan celebration on add-to-cart, and Yale-colored confetti with a party-hat Dan on order placement.

### Prompt 10

> for handsom dan add in an animation as the chat is loading, make it look like its thinking

**Missing from the first prompt:** Replaces the plain typing dots with an embodied "thinking" state for Handsome Dan (head tilt, pondering eyes, and a pulsing thought bubble) while the agent's reply loads.

---

## Part 11: Testing the Site

### Prompt 1

> ok move to part 11

### Prompt 2

> ok in this part we are going to be testing the site, do nothing with that

**Missing from the first prompt:** It only moved to the next part; this sets the part's focus — testing the site.

### Prompt 3

> ok we are going to run a live test of the website and we are going to document it in output/app_check.html. this should be a page that we can double click to open. I want to include screenshots of the website with short captions for the three following chat checking the inventory of the item and that its correct with the database, the dynamic search result cards after searching for quarter zips, and one of the usability updates we did in part 9. This HTML need to be easily readable so that a grader can quickly open it and understand. this should include headings for each of the checks, screenshots, and short one to two sentences on what the screenshot proves. put the screenshots in outputs/app_check_images, link them in the html and include the pathways.

**Missing from the first prompt:** It set testing as the focus; this specifies a double-clickable `outputs/app_check.html` report with headings, real screenshots (in `outputs/app_check_images/`, linked with paths) and 1–2 sentence captions for three checks: chat inventory vs. database, chat-driven quarter-zip search cards, and a Part 9 usability feature.

---

## Part 12: Audit Trail and Safety Guidelines

### Prompt 1

> great , move onto part 12

### Prompt 2

> we are going to make an audit trail and add safety guidelines. do nothing with this

**Missing from the first prompt:** It only moved to the next part; this sets the focus — building an audit trail and adding safety guidelines.

### Prompt 3

> ok create an append only output/audit_trail.json file of the agent activity. include the time, tools name, a short description of the argument or result, and the stop reason. do not wipe it inbetween runs

**Missing from the first prompt:** It named the part; this specifies the audit trail concretely — an append-only `outputs/audit_trail.json` recording each agent tool call and run with timestamp, tool name, a short arg/result description, and stop reason, never wiped between runs.

### Prompt 4

> alright lets add safety rules to the agent and add them into the prompts/prompts.md. Be sure the agent does not make up information. and additional conventions so that the agent is really safe. In the harness.md file, add a bit more information: the model fields from models.py and why they were chosen, the tools and abilities, safety rules, and specs (loop limits, result caps, models, how to run the front and back end)

**Missing from the first prompt:** It set the part's focus; this specifies the concrete safety work — a strengthened "never make things up" rule plus added safety conventions in `prompts.md`, real loop limits, and a harness expansion covering the `models.py` fields and rationale, tools/abilities, safety rules, and specs (loop limits, result caps, model, run instructions).

### Prompt 5

> add in my readme file and requirements file

**Missing from the first prompt:** It covered safety and the harness; this adds the project-level `README.md` (overview, structure, setup, run instructions, features, test account) and a root `requirements.txt` for the Python dependencies.

---

## Part 13: Formatting for Grading

### Prompt 1

> ok moving onto part 13

### Prompt 2

> ok we are going to be formating everything for grading. to not do anything with that

**Missing from the first prompt:** It only moved to the next part; this sets the focus — formatting everything for grading.

### Prompt 3

> ok create a file hw4 include the AI_Prompts.md, requirements, .env.example,.gitignore, readme, frontend, backend, and output. make sure to not include my real .env file and the campus_customs database. use the .gitignore and .env.example as placeholders. the readme file should also explain ow to run the front and back end after placing the data pack in.

**Missing from the first prompt:** It set formatting as the focus; this specifies the exact `hw4/` submission package — which files to include, excluding the real `.env` and the database, adding placeholder `.env.example` and `.gitignore`, and a README that explains running the front and back end after the data pack is placed in.
