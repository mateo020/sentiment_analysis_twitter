const router = require('express').Router()
var { TwitterApi } = require('twitter-api-v2');
 

const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAABwsewEAAAAAm74U7wxWxEpqQHfedr30snn9Mis%3DWwy9emePX3eGazSxe3RV6QSZfyXA3ueJFBWCmo4MbBZwCIq8zW');

// To get trending topics...
router.get('/search', async (req, res, next) => {
  try {
    const id = req.query.query
    const roClient = twitterClient.readOnly;
    const user = await roClient.v2.get('tweets/search/recent', {
      query: id,
      max_results: 35
    });
    
    
    res.send(user)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
})

// This route gets the WOEID for a particular location (lat/long)
router.get('/near-me', async (req, res, next) => {
  try {
    const { lat, long } = req.query
    const response = await client.get('/trends/closest.json', {
      lat,
      long,
    })
    res.send(response)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
})

module.exports = router