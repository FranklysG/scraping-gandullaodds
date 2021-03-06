const express = require('express');
const puppeteer = require('puppeteer');

const app = express()
const port = 3000

app.get('/', async (request, response) => {
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768});
  await page.goto('https://ge.globo.com/agenda/#/todos/');
  // await page.goto('https://ge.globo.com/agenda/#/todos/06-02-2022');
  const soccerPlayToday = await page.evaluate(() => {

    const events_today = [];
    const sport_feed = document.querySelector('[data-testid="sport-feed-container"]');
    const championships = sport_feed.querySelectorAll('[data-testid="group-by-championship"]');

    championships.forEach((element) => {
      // open all container's 
      document.querySelectorAll('[data-testid="default-show-more-button"]').forEach(element => {
        element.click();
      });

      // get all championship name
      const championship_name = element.querySelector('div > span').innerHTML; 
      const games_today = [];

      const card_game = element.querySelectorAll('div > a');
      card_game.forEach((element) => {

        time = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > span');
        if([...time].length === 0){
          //  in live
          time = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > div > span');
          if([...time].length === 0){
            // closed
            time = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div ');
            if([...time].length === 0){
              // know how it was
              time = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > a > span');
            }
          }
        }

        const game_time = [...time].shift().innerText;

        // get all exists games
        const match = element.querySelectorAll('div > div');
        const championship_games = [];
        match.forEach((element) => {
          const team_name = element.querySelectorAll('span > span');
          const how_was_game = [];
          
          team_name.forEach((name) => {

            const team_score = element.querySelectorAll('div > span[data-testid="score-line-score"]');
            if(team_score.length !== 0){
              team_score.forEach((score) => {
                how_was_game.push({'team_name': name.innerHTML, 'team_score': score.innerHTML});
              });
            }else{
              how_was_game.push({'team_name': name.innerHTML, 'team_score': 0});
            }

          });

          if(how_was_game.length !== 0){
            championship_games.push(how_was_game);
          }
        }
        );
        
        if(championship_games.length !== 0){
          games_today.push({championship_games, game_time});
        }
      });
     
      events_today.push({championship_name,games_today});
    });
    
   
    return JSON.stringify(events_today);

  });

  await browser.close();
  
  response.send(soccerPlayToday);
});


app.listen(port, () => {
  console.log(`
    Servidor subiu com sucesso!
    Acesse em http:localhost:${port}
  `);
});
