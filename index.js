require( 'dotenv' ).config();
const CronJob = require('cron').CronJob;
const axios = require('axios');
const momentZone = require('moment-timezone');
const { Client } = require( '@elastic/elasticsearch' )
let fs = require('fs');

const elasticClient = new Client({ node: process.env.ELASTIC_NODE })
const ny = momentZone().tz("America/New_York")


const {
    handleUpsertData
} = require('./handler');

// function readJSONFile() {
//     return new Promise((resolve, reject) => {
//       fs.readFile('D:/Cheddar/json.json', 'utf-8', (err, data) => { 
//         if (err) reject(err);
//         resolve(JSON.parse(data));
//       });
//     });
// }

// async function getData( url ) {
//     const endpoint = url;
//     const config = {
//         headers: {
//         "Content-Type": "application/json",
//         },
//     };
//     // Add Your Key Here!!!
//     // axios.defaults.headers.common = {
//     //     "x-api-key": "dPnKIbgQLJaezOPWvOTQkaBPBjMiCyRy7Dnw3zDL",
//     // };
//     const data = await axios({
//         method: "get",
//         url: endpoint,
//         config,
//     })
//     console.log(data)
// };

async function getData( endpoint ) {
    let url = endpoint;
    const response = await axios.get(url)
    return response
}

// let job = new CronJob('10/10 9-23 * * 1-5', async function() {
let lte_ny = ny.subtract(10,'minutes');
let lte = lte_ny.format('HH:mm');
let gte_ny = ny.subtract(10,'minutes');
let gte = gte_ny.format('HH:mm');
let runJob = async () => { new CronJob('10/10 9-23 * * 1-5', async function() {
        if (momentZone().tz("America/New_York").format('HH:mm') > '09:49'){
            let endpoint = `http://13.250.47.31:3000/fetch?cmd=TOP&symbol=@top100&limit=500&time_gte=${gte}&time_lte=${lte}`
            let dateNow = momentZone().tz("America/New_York").format("YYYY-MM-DD HH:mm ZZ");
            console.log( endpoint );
            let json = await getData( endpoint);
            // console.log( json )
            let jsonParse = json.data;
            let jsonData = jsonParse.data;
            // console.log( jsonData )
            let count = 0;
            for ( let dataIngest of jsonData ){
                count ++;
                await handleUpsertData( elasticClient, dataIngest );
            }
            
            console.log( gte,` - `,lte, `hit data total ${count} now: `,dateNow);
            console.log( endpoint );
        } else {
            console.log(`time < 09.50`, ' now: ',momentZone().tz("America/New_York").format('HH:mm'))
        }
}, null, true, 'America/New_York')};

runJob().catch((e) => {
    console.error(`consume message: ${e.jsonData}`);
 });