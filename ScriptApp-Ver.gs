var NEWS_API_KEY = "1cb3ca22268a477b9d2a2f65c940ecfa";

var BLOG_ID = '2402205635238914485';

function postToBlog(publicationName,publicationKey,channel,max,suppressImages) {
  
  

  //var ss = SpreadsheetApp.getActiveSpreadsheet();
//  var toPublish = ss.getSheetByName('To Publish');
  //   var data  = ss.getDataRange().getValues();

  
  //  data.splice(parseInt(0), 1);  // remove the first header row
  //for (var i in data) {
 
 // var publicationKey  = nfl-news;             // data[i][1];
    
        
    
      var newsUrl = "https://newsapi.org/v1/articles?source=usa-today&sortBy=top&apiKey="+NEWS_API_KEY;

  
 // var newsUrl = "https://newsapi.org/v1/articles?source="+publicationKey+"&sortBy=top&apiKey="+NEWS_API_KEY;
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
     var readurl = articles[a].url

   
    var blogId = BLOG_ID
  var title = articles[a].title
  var content = articles[a].description 
 var image = articles[a].urlToImage
 var imgbody = "<img  src=\""+image+"\">"+content+"<a href=\""+readurl+"\">"
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
var service = ScriptApp.getService();

 //var service = getBloggerService_();
//if (scriptApp.hasAccess()){
//  if (service.hasAccess()) {

var token = ScriptApp.getOAuthToken();

    var api = 'https://www.googleapis.com/blogger/v3/blogs/' + blogId + '/posts/';
 
    
  var headers = {
  'Authorization': 'Bearer ' + token //ScriptApp.getOAuthToken() //contains Blogger scope always
}; 
    
    
  // var headers = {
  //   'Authorization': 'Bearer ' + getBloggerService_().getAccessToken()
 // };
    
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
//}
  //else {
    var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    var authorizationUrl = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    
 //  var authorizationUrl = service.getAuthorizationUrl();
  //Logger.log(authInfo); 
  //  Logger.log('Open the following URL and re-run the script: %s',
    //   authInfo.getAuthorizationUrl())

  }
  
