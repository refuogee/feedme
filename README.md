# FeedMe
#### Video Demo: https://www.youtube.com/watch?v=0FyWLaahzjE
#### Description: FeedMe finds and displays restaurants around you helping you find new places to eat.

#### Longer Description: FeedMe makes use of the Google Maps and Places Javascript APIs to search around given coordinates and return restaurants. When a user clicks on a location the same APIs are used to serve more information to the user with the idea that they then engage with the business.

## How to use FeedMe
You activate the search for restaurants by either allowing the browser to use your location or by inputting an address.

### File List:
##### Feedme.html
This is where the magic starts. By including the Google Maps Javascript Libraries as a script in the header we are able to make use of their libraries using Javascript calls.
This file is quite empty as Javascript has to do most of the heavy lifting with making API calls as well as adding and manipulating DOM elements.

##### feedme.js
This is where all the logic lives. Using Google's [documentation](https://developers.google.com/maps/documentation/javascript/overview) and of course tons of Stack Overflow pages, I was able to create the functionality that you engage with upon opening Feedme.html.

##### feedme.css
The css styling for the app.

##### icon.png
This is the icon that indicates a restaurant.

##### search.png
The search image that is used to indicate to users that they can search for another address / area.

### The Idea Evolution
#### 1. Gig Guide
As a part time musician I had at first wanted to make some sort of 'gig guide' using Google's APIs but two issues arose. One was that the data used by Google Places / Businesses is mostly user generated. Either by the 'owner' of the Google Place or by other Google users who have contributed content (photos or reviews) to a place on Google Maps. Therefore unless I engaged with every single business I couldn't get any sort of 'Playing Tonight' data. The second issue is that the city I live in (Johannesburg, South Africa) does not have a plethora of music venues that put on live music every night so even if the data was available it would have been hard to test and engage with.

#### 2. Food Specials
My second thought along these lines was 'Food Specials'. This ultimately led to FeedMe but initially (and possibly a more useful concept) I had wanted to display restaurants around a user and display the specials they had that day / evening. Once again I was limited by the fact that the data would of course not exist or be linked to the Google Places data. My thinking is that if this project were to be taken further, you could allow users to submit data for the various places if they could prove that they owned or had editing rights for that Google Place (which is of course quite normal, local businesses can 'own' and edit this data). This could be done via Google's auth procedures but it is a little above and beyond my abilities and knowledge. I have in the past tried to investigate various Google Places / My Business pages and you have to (justifiably) get through quite a few levels of Google bureaucracy in order to engage with this information.

#### 3. FeedMe
So thirdly I tweaked my idea slightly and chose to display various restaurants and any associated info I could gather, around a given set of coordinates.

While Google Maps does now offer the ability to 'show restaurants around you' my app's sole focus is just this functionality so there is no extra Google Maps info clutter by only showing you restaurants etc. My thinking is that I wanted to build something fun using APIs and I do think the relevance is twofold: Finding new places to eat around you that you might have no idea existed. We are all creatures of habit and gravitate to what we know so the idea of displaying a smorgasbord of food options around you was enticing. Secondly if this become some sort of publically used tool I think it would increase business to these establishments.

One interesting fact I noticed is that a lot of places around me had user generated content (as in users of the Place not the owner's of the Place) for things like the photos linked to the Google Place. This could have a knockon effect and cause establishments to understand Google Places as a tool better and realise that often this is a first point of contact for their business and if they are not managing their Google Place can have quite a negative first impression as the picture's might be poor or the highlighted reviews might not be great etc.

### Walkthrough
Upon navigating to Feedme a user is prompted to either allow the browser to determine their location or search for an area or address.

#### Location
Using html5's Geolocation services the browser returns a set of coordinates.

#### Search
The same applies to searching for an address. Using Google's autocomplete library (they handle almost everything here). A user searches a location a list of options are displayed and once a user clicks on an option the coordinates are returned.

#### Results
Once feedme has a set of coordinates the fun starts.
I built a custom zoom in and pan function because without slightly delaying how the map displays returned data the 'journey' would be quite abrubt especially if searching for another area, ie the new area would just load immediately onscreen. Just because I thought it was nice to do I created a better user experience by zooming in and out once a user inputs a new address etc.

Once the zoom in and pan functions have run the user is displayed with a map of an area they decided upon and icons start to 'pop up' on screen.

At this point I found out that even with pagination Google's Nearby Search functionality only returns 60 results. While 60 results is plenty I had envisioned a lot more so I built functionality that took the initial coordinates and created 6 other 'zones' around these and searched these 'zones' thus giving users up to 360 responses. I also had to check for duplicates of course.

Hovering over an icon reveals the establishments name and when the user clicks on said icon an 'infoWindow' opens displaying a photo gallery, address, contact details and review gallery.

If a user wants they can click to get directions (quite amusingly taken to Google maps), to phone the establishment or visit their website which would be seen as a 'successful transaction'.

### Issues Encountered
#### Costs
So one of the 'biggest' issues and a possible stumbling block to 'taking this live' is that Google charges for the use of their APIs. They of course should because this is amazing and valuable data however during testing I ran up a bit of an expensive bill.
I was aware of this and of course had to provide my credit card details to access the APIs and Google does give you the opportunity to limit API calls and monitor your billing but I still go caught out a little. Google offers users a $200 credit but if you go over that you pay.

Also as per their pricing documents different API calls have different cost tiers.

While this was annoying it actually helped order my thinking. As described above a user is served with up to 360 restaurants. Initially I had looped through ALL results to get all their 'expensive' data, things like website, reviews, up to 10 photos etc so I could potentially have made 360 calls each time my results were returned. So 3 calls and I'd already have made 1000 calls. This was NOT smart and as a result I refined this and only made 'expensive' calls when a user showed interest in a particular place.

#### Cost Knockons
So obviously an awesome feature of restaurants around you would be to filter / segment them by something like food type perhaps. This can 'sort of' be done. Instead of a 'nearby search' you can perform a 'text search' for places of type 'restaurant' and then a text query 'chicken / Italian / Indian' etc but due to my hitting those cost barriers I was quite wary to do this because I imagined having to basically do my 7 calls (the given coordinates + six other zones) as many times as I had filter options so that if a user chose 'Chicken' I would hide all the other results and only display those that had been returned when searching for 'Chicken'. I am sure there would be an easier / better way to do this but due to worrying about costs I shelved this.

Another item here would be using a possible filter on how long it might take a user to get there. "10 minutes away / 15 / 20" etc. Amazingly you can access this info that you get when looking for directions using maps etc BUT again these are quite expensive calls and I might have to ask based on each establishment and a user's given coordinates which could possibly be really expensive. Even just distance away is similarly cost inducing.

#### The Data
During development I showed various people around me, getting feedback and researching where they hit snags etc and many of them had some quite nice suggestions. 'Show child friendly places', 'show the menu', 'It'd be cool if you could click through to Uber Eats etc'. While these were all awesome suggestions I am essentially limited by the data available to me. If your establishment is not on Google Maps / have a Google Place etc they would not be shown on Feedme. While I would of course have LOVED to show a menu, that data is not available. Yet or possibly ever.

Another issue here is that if a Google Place is unclaimed meaning it might exist on maps due to users searching for it and or reviewing it or adding photos of said place the actual owner of the establishment might not have claimed the place panel you get when searching via Google. This means that the content can be quite substandard. The main associated picture could be of the parking lot etc, photos can be strange, irregular dimensions due it being 'user generated'. This just makes it tricky to handle comfortably.

I liked the idea of this being almost 'self sustaining' as in, once it was built, there would be very little 'legwork', I wouldn't have to go to any of these places and verify any data etc. I could just set it up and watch the results flow in. However if this was to be a fully fledged app I would probably have to create some sort of user account that once linked and verified to a Google Place would allow users to upload any of this information which could then get used to offer users as filters in their searches. This of course raises a question as to why would a business owner do that when they already might do this with their actual Google Places page. So a bit of an issue there.


#### Google's Javascript Library Limitations
I say limitations slightly sarcastically because these were obviously design choices made by incredibly intelligent people. The limitations are more on my part.
Most of the API services offered could return Promises which is an awesome way to deal with the data - you can make a call, 'wait' for the data, update an array and once its finished then call the next function to deal with said data.

The Google Places API does not however work using promises. This API is the one being called to return 'nearby search' results. What this meant for me - and of course down to my understanding and skill level - is that I could not get the results and then deal with them systematically but rather once the call was made, a callback was called which then put the markers on the map, added event listeners etc etc. I would have prefered to 'separate these concerns' and have each of them in functions and as each piece of data was returned, make the next call etc.

While everything worked out on the frontend I definitely felt that my code readability suffered as a result and as a possible refactor in the future I would love to be able to break these up better.


### Next Steps
#### FeedMe Next Steps
If this were to be turned into a fully fledged business opportunity. I would probably have to approach Google to discuss costing (they do offer this). I could also offset this by using advertising and of course, eventually maybe some sort of subscription model.

I would like to get much more data and I do think showing users specials around them could make this better and possibly more useful to users. Of course this would help business owners too as this would increase interest in their establishments.

This similar idea could also be rolled out to almost any industry and maybe get users into stores because they could see businesses around them that offer awesome deals.

#### Code Next Steps
#### Separate Concerns
As my learning as progressed I have become aware of design patterns and the need for 'separating concerns' in my code. I don't like that ALL my logic is in one Javascript file. I definitely would like to break it up into Model View Controller (MVC) type logic however I have not yet dabbled in this only explored articles explaining how. So this is definitely something I would like to investigate going forward and then refactor my code along these lines.

#### Promises etc
As discussed above I definitely think due to my lack of abiliity I was unable to separate my code as much as I would have liked and this is something I want to understand better and be able to implement better.


