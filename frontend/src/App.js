import logo from './twitter.svg';
import './App.css';
import { FaCrosshairs } from 'react-icons/fa';
import {useReducer, useState, useEffect} from 'react'
import axios from 'axios'
//tensorflow imports

import * as tf from '@tensorflow/tfjs';
import * as toxicity from "@tensorflow-models/toxicity";

import padSequences from './paddedSeq'

// const sentimentModel = await tf.loadLayersModel('https://github.com/mateo020/Tweet_Emotion_Recognitio/blob/main/model.json');


// const modelSent = 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json'
// const metadata = 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'


// const SentimentThreshold = {
//   Positive: 0.66,
//   Neutral: 0.33,
//   Negative: 0
// }

// const PAD_INDEX = 0;
// const OOV_INDEX = 2;




function App() {
  const [isShown, setIsShown] = useState(false);

  const [phrase, setPhrase] = useState('');
  const [tweets, setTweet] = useState([]);
  const [counter, setCounter] = useState(0);
  const [counterToxic, setCounter1] = useState(0);
  const [counterThreat, setCounter2] = useState(0);

  const [metadata, setMetadata] = useState();
  const [model1, setModel] = useState();
  const [testText, setText] = useState("");
  const [testScore, setScore] = useState("");
  const [trimedText, setTrim] = useState("")
  const [seqText, setSeq] = useState("")
  const [padText, setPad] = useState("")
  const [inputText, setInput] = useState("")


  const [displayTweets, setDisplayTweets] = useState([])
  const [displatTweetScore, setTweetscore] = useState([])

  const [emotionScore, setEmotion] = useState()

  const url = {

    model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
    metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
};

  const OOV_INDEX = 2;

  async function loadModel(url) {
    try {
      const model = await tf.loadLayersModel(url.model);
      setModel(model);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadMetadata(url) {
    try {
      const metadataJson = await fetch(url.metadata);
      const metadata = await metadataJson.json();
      setMetadata(metadata);
    } catch (err) {
      console.log(err);
    }
  }

  const getSentimentScore =(text) => {
    // console.log(text)
    const inputText = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    setTrim(inputText)
    // console.log(inputText)
    const sequence = inputText.map(word => {
      let wordIndex = metadata.word_index[word] + metadata.index_from;
      if (wordIndex > metadata.vocabulary_size) {
        wordIndex = OOV_INDEX;
      }
      return wordIndex;
    });
    setSeq(sequence)
    // console.log(sequence)
    // Perform truncation and padding.
    const paddedSequence = padSequences([sequence], metadata.max_len);
    // console.log(metadata.max_len)
    setPad(paddedSequence)
  
    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);
    // console.log(input)
    setInput(input)
    const predictOut = model1.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    setScore(score)  
    return score;
  }

  function processTwitterData(tweets){
    const tweetScores = [];
    for( const tweet of tweets){
      const score = getSentimentScore(tweet)
      tweetScores.push(score)     

      
    }
    return tweetScores;

  }  
  


  const GetInputValue = (event) => {
    setPhrase(event.target.value)
    
    
  }

  
  
  useEffect(() =>{  
     axios
    .get('/api/search', {params:{ 
      query: phrase
    }})
    .then(response => {
      // console.log(response.data.data) 
      setTweet(response.data.data)
    })
    .catch(error => console.log(error.message))
  },[phrase])
  

  const increase = () => {
    setCounter(count => count + 1);
  }

  const reset =() => {
    setCounter(0);

  }

  const increase1 = () => {
    setCounter1(count => count + 1);
  }

  const reset1 =() => {
    setCounter1(0);
    
  }
  const increase2 = () => {
    setCounter2(count => count + 1);
  }

  const reset2 =() => {
    setCounter2(0);
  }


  


  function getToxicity(){
  
    const tweetArray = tweets.map((tweet, index) => {
      return tweet.text
         
    })
    
    // console.log(tweetArray)
    const scoresArray = processTwitterData(tweetArray)
    // console.log(scoresArray)

    setDisplayTweets(tweetArray)
    setTweetscore(scoresArray)
    
    setEmotion(getEmotion())

    toxicity.load(0.8).then(model=> {
      model.classify(tweetArray).then( predictions => {
        // console.log(predictions)
        for(let i =0; i < 10; i++){
          // console.log(predictions[1].results[i].match);
          if(predictions[1].results[i].match === true){
            increase()
          }
          
        }

        for(let i =0; i < 10; i++){
          // console.log(predictions[6].results[i].match);
          if(predictions[6].results[i].match === true){
            increase1()
          }
          
        }
        for(let i =0; i < 10; i++){
          // console.log(predictions[5].results[i].match);
          if(predictions[5].results[i].match === true){
            increase2()
          }
          
        }


        // console.log(counter)
        // console.log(counterToxic)
        // console.log(counterThreat)

        
      })
    })
    setIsShown(true); 
   
    reset()
    reset1()
    reset2()

  }

  useEffect(()=>{
    tf.ready().then(
      ()=>{
        loadModel(url)
        loadMetadata(url)
      }
    );
  
  },[])

  function getEmotion(){
    var sum = 0
    for (const score of displatTweetScore){
        sum += score
    }
    var averageScore = sum
    const length = displatTweetScore.length
    averageScore = averageScore/length
    averageScore = averageScore*10
    return averageScore;

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="logo" alt="twitter" />
        <h3> Twitter Sentiment Score</h3>
      </header>
      <div className='menu'>
      <input value={phrase} placeholder= "Search a Topic on Twitter ..." onChange={GetInputValue} 
          style={{ padding: '20px', fontSize: '20px', width: '90%' }} />
     
     <input type="button" value="SEARCH" onClick={getToxicity} style={{ padding: '20px', fontSize: '20px', width: '30%' }}/>   
      </div>
      
      {isShown &&
      <div>
        <h2>Emotion sentiment score: {emotionScore/10}</h2>
        <h3>Sentiment score in a scale of 0-1, 0 being negative, 1 positive.</h3>
        <input type="range" name="quantity" min="0" max="10"  value={emotionScore} style={{ padding: '20px', height: '50%', width: '50%' }}/>
        <h1>Number of Toxic tweets: {counter}</h1>
        <h1>Number of Insultuing tweets: {counterToxic}</h1>
        <h1>Number of Threatning tweets: {counterThreat}</h1>
        {displayTweets.map((tweet,index) =>{
          return(
            <li>
              {tweet}
              {displatTweetScore[index] && (<span className='tweet_volume'>{displatTweetScore[index]} </span>)}
            </li>
          ) 

        } )}
      

      </div>
      

      
      }

   
  
    </div>
  );
}

export default App;
