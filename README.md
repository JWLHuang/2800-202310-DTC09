<h1>TableTrek</h1>
TableTrek is a Michelin-rated restaurant app to help culinary enthusiasts find personally recommended Michelin-rated restaurants using artificial intelligence.

*COMP 2800 (DTC-09) - Eric Deau, Jacky Huang, Derek Woo, Nathan Yau*


<h2>Technology Used:</h2>
<h3>Framework</h3>
<ul>
<li>Express.js</li>
<li>EJS (Embedded JavaScript)</li>
</ul>


<h3>Runtime Environment</h3>
<ul>
<li>Node.js</li>
</ul>


<h3>Other</h3>
<ul>
<li>Bootstrap - Styling</li>
<li>OpenAI - AI API</li>
<li>ChatGPT - Data augmentation</li>
<li>logoai - Logo creation</li>
<li>Cyclic - Hosting</li>
<li>MongoDB - Database hosting</li>
<li>Pexels.com - Stock images</li>
</ul>


<h3>Dependencies</h3>
<ul>
<li>Azure-openai v0.9.4</li>
<li>Bcrypt v5.1.0</li>
<li>Connect-mongo v5.0.0</li>
<li>Dotenv v16.0.3</li>
<li>Ejs v3.1.9</li>
<li>Express v.4.18.2</li>
<li>Express-session v1.17.3</li>
<li>Joi v17.9.2</li>
<li>Mongoose v7.1.0</li>
<li>Multer v1.4.5-lts.1</li>
<li>Nodemon v2.0.22</li>
<li>Openai v3.2.1</li>
<li>Passport v0.6.0</li>
<li>Passport-google-oauth v2.0.0</li>
</ul>

<h3>API Keys</h3>
<ul>
<li>OpenAI API Key</li>
<li>Azure OpenAI API Endpoint and Key</li>
</ul>


<h2>Files</h2>


```
|   .gitignore                                      # List files to exclude from the git repository
|   index.html                                      # Placeholder landing page
|   package-lock.json                               # Contains the locked dependency list
|   package.json                                    # Contains the dependency list
|   README.md                                       # Contains information about the project
|  
+---backend                                         # Folder for all back-end related files
|   |   .env # Contains
|   |   aboutUsRoutes.js                            # Displays about us pages
|   |   aiFilter.js                                 # Function to filter restaurant by AI
|   |   aiReviews.js                                # Function to generate reviews and rating by AI
|   |   app.js                                      # Home and 404 routes
|   |   authorizationMiddleware.js                  # Middleware to check whether user is logged in
|   |   authorizationRoutes.js                      # Routes for login pages
|   |   calculateRestaurantRating.js                # Function to attach the rating of restaurants and user
|   |   contactRoutes.js                            # Function to display the contact us page
|   |   database.js                                 # Function to connect MongoDB database
|   |   extAuthRoutes.js                            # Routes for external Google login
|   |   findUser.js                                 # Function to find the active user object
|   |   forgotPasswordRoutes.js                     # Routes for forgot password feature
|   |   getIndividualRating.js                      # Function to get the individual restaurant rating for a user
|   |   getRestaurantRatings.js                     # Function to get the individual restaurant rating based on reviews
|   |   getSearchQuery.js                           # Function to capture the filters selected
|   |   historyRoutes.js                            # Routes for restaurant viewing history
|   |   mapRoutes.js                                # Routes for map feature
|   |   planMyDay.js                                # Function to send restaurant list and prompt to ChatGPT for itinerary
|   |   planMyDayRoutes.js                          # Routes for Plan My Day Itinerary feature
|   |   profileRoutes.js                            # Routes for personal profile management
|   |   resetPasswordRoutes.js                      # Routes for password reset feature
|   |   restaurantListRoutes.js                     # Routes for filtered restaurant list and restaurant pages
|   |   reviewRoutes.js                             # Routes for leaving a review
|   |   server.js                                   # Function to connect the database and start the server
|   |   signupRoutes.js                             # Routes for account signup pages
|   |  
|   +---models
|   |       criteriaModel                           # Mongoose model for dining factor ranking criteria
|   |       restaurantModel                         # Mongoose model for restaurant objects
|   |       reviewModel                             # Mongoose model for review objects
|   |       usersModel                              # Mongoose model for user objects
|   |      
|   \---schema
|           contactSchema.js                        # Joi schema for validating contact form
|           factorSchema.js                         # Joi schema for validating factor ranking
|           forgotPasswordSchema.js                 # Joi schema for validating Forgot Password form
|           loginSchema.js                          # Joi schema for validating login form
|           profileSchema.js                        # Joi schema for validating profile About Me form
|           resetPasswordSchema.js                  # Joi schema for validating Reset Password form
|           reviewSchema.js                         # Joi schema for validating review submission form
|           signupSchema.js                         # Joi schema for validating signup form
|           smartReviewSchema.js                    # Joi schema for validating smart review submission form
|          
\---frontend                                        # Folder for all front-end related files
   +---public
   |   +---images                                  # Folder for images
   |   |   +---profile_pics                        # Folder for stock profile image
   |   |   |       stockphoto.jpg                  # Source: https://pbs.twimg.com/media/DrsPo7oUwAATUdF.jpg
   |   |   |      
   |   |   \---site_resources
   |   |           404.png                         # Source: https://cdn.vox-cdn.com/uploads/chorus_image/image/56950973/sad_bibendum.0.jpg
   |   |           nav_logo.png                    # Designed using LogoAI
   |   |           restaurant01.jpg                # Source: https://unsplash.com/photos/poI7DelFiVA
   |   |           restaurant02.jpg                # Source: https://unsplash.com/photos/N_Y88TWmGwA
   |   |           restaurant03.jpg                # Source: https://unsplash.com/photos/nmpW_WwwVSc
   |   |          
   |   +---script
   |   |       authentication.js                   # Javascript scripts for authenticating a user
   |   |       footerLinks.js                      # Javascript scripts for generating links in footer
   |   |       generateReview.js                   # Javascript scripts for handling the submission of reviews
   |   |       map.js                              # Javascript scripts for rendering the map
   |   |       myReviews.js                        # Javascript scripts for handling clicks on the My Reviews page
   |   |       navbarLinks.js                      # Javascript scripts for generating links in navbar
   |   |       profile.js                          # Javascript scripts for handling interactions on the profile page
   |   |       profileLinks.js                     # Javascript scripts for generating links on the profile page
   |   |       restaurant.js                       # Javascript scripts for customizing directions to restaurant
   |   |       snake.js                            # Javascript scripts for rendering and handling snake easter egg
   |   |       writeReview.js                      # Javascript scripts for handling interactions when writing reviews
   |   |      
   |   \---style
   |           aboutUs.css                         # Styling CSS for the About Us page
   |           authentication.css                  # Styling CSS for the authentication page
   |           button.css                          # Styling CSS for the buttons in the application
   |           contact.css                         # Styling CSS for the Contact Us page
   |           footer.css                          # Styling CSS for the footer
   |           index.css                           # Styling CSS for the index page
   |           map.css                             # Styling CSS for the map
   |           mobileFooter.css                    # Styling for the mobile bottom navbar
   |           myReviews.css                       # Styling CSS for user reviews
   |           navbar.css                          # Styling CSS for the navbar
   |           profile.css                         # Styling CSS for the profile page
   |           restaurant.css                      # Styling CSS for the individual restaurant page
   |           restaurantCard.css                  # Styling CSS for the restaurant cards generated in a list
   |           restaurantThumbnail.css             # Styling for restaurant thumbnails
   |           signup.css                          # Styling CSS for the signup page
   |           snake.css                           # Styling CSS for the easter egg page
   |           writeReview.css                     # Styling CSS for the creating a review page
   |          
   \---views
       |   404.ejs                                 # Display the 404 page
       |   about.ejs                               # Display the about us page
       |   authentication.ejs                      # Display the login and signup page
       |   contact.ejs                             # Display the contact us page
       |   filterRestaurants.ejs                   # Display the restaurant filter form
       |   forgotPassword.ejs                      # Display the account recovery page
       |   history.ejs                             # Display the account restaurant history page
       |   index.ejs                               # Display the main landing page (before and after login)
       |   map.ejs                                 # Display the map populated with restaurant pins
       |   myReviews.ejs                           # Display the user’s reviews on one page
       |   planMyDay.ejs                           # Display the personalized itinerary
       |   profile.ejs                             # Display the profile page
       |   resetPassword.ejs                       # Display the password reset page
       |   restaurant.ejs                          # Display the detailed restaurant information page
       |   restaurantList.ejs                      # Display the list of filtered restaurants
       |   skeleton.ejs                            # Template for loading the top navbar, bottom navbar and copyright
       |   smartReview.ejs                         # Display front-end for the AI-powered review generator
       |   snake.ejs                               # Display the easter-egg
       |   svgIcons.ejs                            # Store the avg icons
       |   writeReview.ejs                         # Display the front end for writing a restaurant review
       |  
       \---partials
           |   contactForm.ejs                     # Display the contact form
           |   footer.ejs                          # Template for the app bottom footer
           |   footerNav.ejs                       # Display the desktop bottom footer when screen size is >768px
           |   header.ejs                          # Template for the app head that includes stylesheets, scripts, and navbar
           |   login.ejs                           # Display the login form
           |   mobileFooterLinks.ejs               # Template for the mobile bottom footer to populate links
           |   mobileFooterNav.ejs                 # Display mobile bottom footer nav when screen size is <768px
           |   navbar.ejs                          # Display the navbar and side menu
           |   navLinks.ejs                        # Template for the top navbar side menu to populate links
           |   planMyDayCard.ejs                   # Displays the personalized itinerary inside three separate cards
           |   restaurantCard.ejs                  # Displays restaurant information inside an individual card
           |   restaurantFunctions.ejs             # Generates stars to represent Michelin Rating
           |   restaurantReviews.ejs               # Displays the restaurant reviews inside an individual card
           |   signup.ejs                          # Display the signup form
           |  
           \---profileTemplates
                   displayProfileTab.ejs           # Displays the tab header
                   navFactors.ejs                  # Displays the user preferences tab
                   navFactorsEdit.ejs              # Displays the edit modal for user preferences
                   navPreferences.ejs              # Displays the dietary preferences tab
                   navPreferencesEdit.ejs          # Displays the edit modal for dietary preferences
                   navProfile.ejs                  # Displays the user information tab
                   navProfileEdit.ejs              # Displays the edit modal for user information
```

<h2>How to install or run the project</h2>
<ol>
<li>Install Visual Studio Code: Download and install VS Code from the official website: code.visualstudio.com</li>
<li>Install Node.js: Download and install Node.js from the official website: nodejs.orgS</li>
<li>Install MongoDB: Download and install MongoDB from the official website: mongodb.com</li>
<li>Install Chrome browse on your local machine from the official website: google.com/intl/en_ca/chrome/dr/download/</li>
<li>Clone the GitHub repository: Use the Git command git clone this repo - https://github.com/JWLHuang/2800-202310-DTC09, to clone the project repository to your local machine</li>
<li>Navigate to the project in Command Prompt and run the command “npm i” to install dependencies</li>
<li>Open the project in Visual Studio Code</li>
<li>Run the command npm install to install the project dependencies.</li>
<li>Create a .env file in the “backend” folder, and populate it with the following information:
<ul>
<li>MONGODB_PROTOCOL - MongoDB database protocol</li>
<li>MONGODB_USER - Username for MongoDB database</li>
<li>MONGODB_PASSWORD - Password for MongoDB database</li>
<li>MONGODB_HOST - Hostname of MongoDB database</li>
<li>MONGODB_DATABASE - MongoDB database name</li>
<li>NODE_SESSION_SECRET - Secret for session encryption</li>
<li>MONGODB_SESSION_SECRET - Secret for MongoDB encryption</li>
<li>VIEW_PATH - Relative path of “views” folder</li>
<li>GOOGLE_CLIENT_ID - Google client secret</li>
<li>GOOGLE_CLIENT_SECRET - Google login secret</li>
<li>GOOGLE_AUTH_CALLBACK - Link to redirect Google login after processing</li>
<li>OPENAI_API_KEY - OpenAI Key</li>
<li>OPENAI_API_KEY_AZ - Azure OpenAI Key</li>
<li>OPENAI_ENDPOINT - Azure OpenAI Endpoint</li>
</ul>
<li>To run the app, navigate to the project’s “backend” folder in Command Prompt and run the command “node ./server.js”</li>
</ol>

<h2>Testing</h2>
Please click here https://docs.google.com/spreadsheets/d/1T4-bbSf9sXRxOtNTIz-RVMphDWBF1UNlXT3_7pT6wGU/edit?usp=sharing to see the testing completed on this project.

<h2>How to use</h2>
<h3>Plan Your Day</h3>
<ol>
<li>Sign in (or create an account)</li>
<li>Tap “Get Started”</li>
<li>Select your filters (Location is required)</li>
<li>Tap “Plan My Day”</li>
<li>Receive a curated list of three restaurants, one for Breakfast, Lunch, and Dinner that align with your dietary preferences and filters</li>
<li>Tap on the name of a restaurant to see more details</li>
</ol>


<h3>Filter Restaurants</h3>
<ol>
<li>Sign in (or create an account)</li>
<li>Tap “Get Started”</li>
<li>Select your filters (Location is required)</li>
<li>Tap “Submit”</li>
<li>Receive a list restaurants choices that align with your dietary preferences and filters</li>
<li>Tap on the name of a restaurant to see more details</li>
</ol>


<h3>Leave a Smart Review</h3>
<ol>
<li>Access a restaurant details page</li>
<li>Tap “Write a Review”</li>
<li>Tap “Smart Review”</li>
<li>Select a tone and describe your experience using the fields</li>
<li>Tap “Generate Review”</li>
<li>Edit the AI-generated review as necessary</li>
<li>Submit your review to save</li>
</ol>

<h2>Credits & References</h2>
<ul>
<li>ChatGPT Log: https://www.notion.so/0270fd4ccb9e4c25ba08b9a0013206f8?v=147bed3fe18640d784ecbbf56561c59d</li>
</ul>

<h2>Known Bugs and Limitations</h2>
<ul>
<li>OpenAI API slows down runtime heavily</li>
<li>Generating smart review sometimes does not generate correctly</li>
<li>Not always possible to reject offensive words when submitting a review</li>
<li>Restaurant card front end does not display correctly if a singular word is long</li>
<li>OpenAI API has limitations based on model used, with davinci-003 being 4000 tokens</li>
</ul>

<h2>Artificial Intelligence</h2>
<ul>
<li> We used AI to augment our dataset with images and hours, as well as to assist in the building functions.</li>
<li> We used AI to help plan out our 30-second pitch video </li>
<li> AI was used to populate example fields into our documents for proof of concept usage.</li>
<li> Our app uses AI to generate smart reviews based on the user’s experience, calculate individual and average ratings for restaurants, and to pick restaurants for the itinerary feature. </li>
<li> Some limitations we had with AI included finances, where some models cost more than others, but were more effective in what we needed the AI to do. Another limitation included OpenAI being unable to process our dataset, so we needed to create prompts that would accept a stringified JSON for the AI to work with.</li>
</ul>

<h2>Contact Information</h2>
<ul>
<li>To contact us, fill out our form at https://tabletrek.cyclic.app/contact </li>
</ul>

