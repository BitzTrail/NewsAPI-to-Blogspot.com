var CLIENT_ID = '714070609501-r9f0gu0p8ih9b3lgepql9sgukv0mr2mk.apps.googleusercontent.com';
var CLIENT_SECRET = 'sNxhhQwCfgv4QWRdv0e4pA1R';
var BLOG_ID = '2402205635238914485';
var NEWS_API_KEY = "1cb3ca22268a477b9d2a2f65c940ecfa";

/*
 * Based on the following work by others;
 * https://mashe.hawksey.info/2015/10/setting-up-oauth2-access-with-google-apps-script-blogger-api-example/
 * https://github.com/googlesamples/apps-script-oauth2
 * https://developers.google.com/blogger/docs/3.0/getting_started
 * https://github.com/benlcollins/apps_script_apis
 * https://www.bettercloud.com/monitor/the-academy/use-apps-script-push-live-news-headlines-slack-google-sheets/
 **/

// add custom menu
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Blogger Menu')
      .addItem('Get Blogger Posts','getBloggerPosts')
      .addItem('Publish post on Blogger','postToBlogger')
      .addToUi();
}



// configure the service
function getBloggerService_() {
  return OAuth2.createService('Blogger')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/blogger');  // this is blogger scope
}

// Logs the redict URI to register
function logRedirectUri() {
  var service = getBloggerService_();
  Logger.log(service.getRedirectUri());
}


// handle the callback
function authCallback(request) {
  var bloggerService = getBloggerService_();
  var isAuthorized = bloggerService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

// Step 1: call the blogger API and get list of blogger sites associated with this google account
function getBloggerSites() {
  var service = getBloggerService_();
  
  if (service.hasAccess()) {
    Logger.log("App has access.");
    var api = "https://www.googleapis.com/blogger/v3/users/self/blogs";
    
    var headers = {
      "Authorization": "Bearer " + getBloggerService_().getAccessToken()
    };
    
    var options = {
      "headers": headers,
      "method" : "GET",
      "muteHttpExceptions": true
    };
    
    var response = UrlFetchApp.fetch(api, options);
    
    var json = JSON.parse(response.getContentText());
    
    var bloggerIds = [];
    
    for (var i in json.items) {
      Logger.log("%s %s", json.items[i].name, json.items[i].url); 
      bloggerIds.push(json.items[i].id);
    }
    Logger.log(bloggerIds);
    //return bloggerIds;
  }
  else {
    Logger.log("App has no access yet.");
    
    // this was the step I was missing originally
    // open this url to gain authorization from blogger
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}


// Step 2: get list of all posts for specific blogger site
function getBloggerPosts() {
  var service = getBloggerService_();
  var blogId = BLOG_ID; // the id for my blogger site Data Chops
  
  var api = 'https://www.googleapis.com/blogger/v3/blogs' + blogId + '/posts';
  
  var headers = {
    "Authorization": "Bearer " + getBloggerService_().getAccessToken()
  };
  
  var options = {
    "headers": headers,
    "method" : "GET",
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(api, options);
  
  var json = JSON.parse(response.getContentText());
  var posts = json["items"];
  
  Logger.log(posts.length); // result is 8, which matches the number of blog posts at http://datachops.blogspot.com/
  //Logger.log(posts[0]);
  
  var postsArray = [];
  
  for (var i = 0; i < posts.length; i++) {
    var authorName = posts[i]["author"]["displayName"];
    var authorImage = '=image("https:' + posts[i]["author"]["image"]["url"] + '",4,60,60)';
    var publishedDate = posts[i]["published"];
    var publishedUrl = posts[i]["url"];
    var title = posts[i]["title"];
    var content = posts[i]["content"];
  
    postsArray.push([publishedDate,title,publishedUrl,authorName,authorImage,content]);
  }
  
  Logger.log(postsArray);
  
  outputToSheet(postsArray);
  
}


// print out results to sheet
function outputToSheet(post) {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var publishedPosts = ss.getSheetByName('Published Posts');
  
  publishedPosts.getRange(4,1,publishedPosts.getLastRow(),4).clearContent();
  
  var outputRange = publishedPosts.getRange(4,1,post.length,4).setValues(post);
  
  /*
  // only need this snippet of code when i'm including thumbnail author images
  for (var i = 0; i < post.length; i++) { 
    publishedPosts.setRowHeight(i + 4,65);
  }
  */
}


// posting blog post from google sheet to blogger
// need to get the content from the sheet into suitable json format
// then post to blogger








function postToBlogger(publicationName,publicationKey,channel,max,suppressImages) {
  
  

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var toPublish = ss.getSheetByName('To Publish');
     var data  = ss.getDataRange().getValues();

  
    data.splice(parseInt(0), 1);  // remove the first header row
  for (var i in data) {
 
  var publicationKey  = data[i][1];
  
  var newsUrl = "https://newsapi.org/v1/articles?source="+publicationKey+"&sortBy=top&apiKey="+NEWS_API_KEY;
  var newsResponse = UrlFetchApp.fetch(newsUrl);
var newsObj = JSON.parse(newsResponse);
  var status = newsObj.status;
  var articles = newsObj.articles;

  for (var a=0; a<articles.length; a++) {
    if (a > (max-1)) { break;}
   //if (suppressImages) { var urlImage = articles[a].urlToImage; } else {var urlImage ="";}
    var attObj =   {
      "fallback": publicationName+" [powered by News API]",
      "color": "#36a64f", 
      "pretext": publicationName+" [powered by News API]",
      "author_name": articles[a].author,
      "title": articles[a].title,
      "title_link": articles[a].url,
      "ImgUrl": articles[a].urlToImage,
      "fields": [
        {
        "title": articles[a].title,
      "value": articles[a].urlToImage,
            "image_url": articles[a].urlToImage,

          "short": false
        }
       ],
      "image_url": articles[a].urlToImage,
      "footer": "Published at: "+articles[a].publishedAt 
   
  
    
  };
  
 
  var kind ='#blogger#post';
 // var kind = toPublish.getRange(4,1).getValue();
 // var blogId = toPublish.getRange(4,2).getValue();
    
    var blogId = BLOG_ID
  var title = articles[a].title
  var content = articles[a].description 
 var image = articles[a].urlToImage
 var imgbody = "<img  src=\""+image+"\">"+content+""
 var body = JSON.stringify({
    'kind': kind,
    'blog': {
      'id': blogId
    },
    'title': title,
   'content': imgbody,
 "images": [
    {
      "url": image
    }
  ],
        
   
   
  
  });
  } 
  Logger.log(body);
  
  var service = getBloggerService_();
  
  if (service.hasAccess()) {
    var api = 'https://www.googleapis.com/blogger/v3/blogs/' + blogId + '/posts/';
    
    var headers = {
      'Authorization': 'Bearer ' + getBloggerService_().getAccessToken()
    };
    
    var options = {
      'headers': headers,
      'method' : 'post',
      'contentType': 'application/json',
      'payload': body,
      'muteHttpExceptions': false
    };
    
    try {
      var response = UrlFetchApp.fetch(api, options);
      
      var responseCode = response.getResponseCode();
      Logger.log(responseCode);
      var json = JSON.parse(response.getContentText());
      Logger.log(json);
    }
    catch(err) {
      Logger.log(err); // error with url fetch call
    }
  }
  else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}
}
