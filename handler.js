const momentZone = require('moment-timezone');

const handleUpsertData = async (elasticClient, msg) => {
    console.log( `START process handle data...` );
    try{
        let body = {
            doc: {
                msg
            },
            doc_as_upsert: true
        };
        await elasticClient.index({
            index: `trade`,
            body: body
        });
        console.log( `FINISED process handle data!`);
    }catch (e) {
        throw e;
    }

};
module.exports = {
    handleUpsertData
};