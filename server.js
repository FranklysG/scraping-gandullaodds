const express = require('express');
const puppeteer = require('puppeteer');

const app = express()
const port = 3000

app.get('/', async (request, response) => {
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ge.globo.com/agenda/#/todos/');
  
  const soccerPlayToday = await page.evaluate(() => {
    // executar toda funçao no navegador
    // pegar toda a seção com os jogos de hoje
    const gamesToday = [];
    const feedEsports = document.querySelector('[data-testid="sport-feed-container"]');
    const champions = feedEsports.querySelectorAll('[data-testid="group-by-championship"]');
    [...champions].forEach(element => {
      // pega o nome do campeonato
      const champion = element.querySelector('div > span').innerHTML; 
      
      // pega todos os jogos de hoje
      const matchToday = [];
      const nodeList = element.querySelectorAll('div > a');
      [...nodeList].forEach(element => {
        // horario do jogo
        matchHour = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > span');
        if([...matchHour].length === 0){
          //  ao vivo
          matchHour = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > div > span');
          if([...matchHour].length === 0){
            // encerrado
            matchHour = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div ');
            if([...matchHour].length === 0){
              // saiba como foi
              matchHour = element.querySelectorAll('[data-testid="event-card-header-wrapper"] > div > a > span');
            }
          }
        }
        const hour = [...matchHour][0].innerText;
        
        // pega os jogos existentes por campeonato
        const matchPerChampion = []
        const match = element.querySelectorAll('div > div');
        [...match].forEach((element) => {const nameScore = [];
            const name = element.querySelectorAll('span > span');
            [...name].forEach((name) => {
              nameScore.push(name.innerHTML);
            });
            const score = element.querySelectorAll('div > span[data-testid="score-line-score"]');
            [...score].forEach((score) => {
              nameScore.push(score.innerHTML);
            });
            matchPerChampion.push(nameScore);
          }
        );

        matchToday.push({matchPerChampion, hour});
      });
     
      gamesToday.push({
        'champion': champion,
        'matchs': matchToday
      });
    });
    
    return JSON.stringify(gamesToday);

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
