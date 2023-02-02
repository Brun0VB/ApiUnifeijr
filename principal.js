const firebase = require("firebase-admin");
const OneSignal = require("onesignal-node");
var serviceAccount = require("C:/asimov/API/serviceAccountKey.json");

// Inicialização do Firebase
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://UnifeiJr.firebaseio.com"
});

// Inicialização do OneSignal
const client = new OneSignal.Client({
  userAuthKey: 'ZjA3N2Q3NzktMmI0YS00OTFjLWFhNmMtODM2OGE5NmM2OTk1',
  app: { appAuthKey: 'MWUyZjMyNzUtMmQ5MS00MDdjLTk5NWMtNzEzOTgwYjIyZmYy', appId: '99966321-1330-4545-b85f-b45ba6bcd866' }
});

// Recupera a referência do banco de dados
const db = firebase.firestore();

let lastDocsLength = 0;
// Recupera a última contagem de documentos do Firestore
const retrieveLastDocsLength = async () => {
  const lastDocsLengthDoc = await db.collection('Noticia').doc('LastDocsLength').get();
  lastDocsLength = lastDocsLengthDoc.exists ? lastDocsLengthDoc.data().value : 0;

};


var request = require('request');

var appId = "99966321-1330-4545-b85f-b45ba6bcd866";
var apiKey = "MWUyZjMyNzUtMmQ5MS00MDdjLTk5NWMtNzEzOTgwYjIyZmYy";

var headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Authorization": "Basic " + apiKey
};

var options = {
  method: "POST",
  url: "https://onesignal.com/api/v1/notifications",
  headers: headers,
  json: true,
  body: {
    app_id: appId,
    contents: {
      en: "Uma nova notícia foi adicionada!"
    },
    included_segments: ["All"]
  }
};





// Define a função que será executada periodicamente
const checkForChanges = async () => {
  // Recupera a referência da coleção desejada
  const collectionRef = db.collection("Noticia");
  //lastDocsLength = valor do documento que guarda o tamanho da coleção anteriormente
  retrieveLastDocsLength();
  console.log(lastDocsLength);
  
  // Verifica se houve alguma mudança na coleção
  const snapshot = await collectionRef.get();
  const docs = snapshot.docs;
  console.log(docs.length);
  if (docs.length > lastDocsLength) {
    // Se houve mudança, envia a notificação push
    // const notification = new OneSignal.Notification({
    //   contents: {
    //     en: "Nova notícia disponível"
    //   }
    // });
    // client.sendNotification(notification).then(response => {
    //   console.log(response.data);
    // });
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.error("Failed to send notification:", error);
      }
    });

    // Atualiza a quantidade de documentos na última verificação
    lastDocsLength = docs.length;
    console.log(lastDocsLength);
    await db.collection('Noticia').doc('LastDocsLength').set({ value: lastDocsLength });
  }
  if (docs.length < lastDocsLength) {
    lastDocsLength = docs.length;
    await db.collection('Noticia').doc('LastDocsLength').set({ value: lastDocsLength });
  }
};

// Define o intervalo de tempo para verificação de mudanças (em milissegundos)
const intervalTime = 5000;

// Inicia o loop de verificação de mudanças
setInterval(checkForChanges, intervalTime);

