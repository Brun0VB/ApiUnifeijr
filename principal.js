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

let lastDocsLengthNoticia = 0;
// Recupera a última contagem de documentos do Firestore
const retrieveLastDocsLengthNoticia = async () => {
  const lastDocsLengthDoc = await db.collection('Noticia').doc('LastDocsLength').get();
  lastDocsLengthNoticia = lastDocsLengthDoc.exists ? lastDocsLengthDoc.data().value : 0;

};
retrieveLastDocsLengthNoticia();
let lastDocsLengthEventos = 0;
// Recupera a última contagem de documentos do Firestore
const retrieveLastDocsLengthEventos = async () => {
  const lastDocsLengthDoc = await db.collection('Eventos').doc('LastDocsLength').get();
  lastDocsLengthEventos = lastDocsLengthDoc.exists ? lastDocsLengthDoc.data().value : 0;

};
retrieveLastDocsLengthEventos();

var request = require('request');

var appId = "99966321-1330-4545-b85f-b45ba6bcd866";
var apiKey = "MWUyZjMyNzUtMmQ5MS00MDdjLTk5NWMtNzEzOTgwYjIyZmYy";

var headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Authorization": "Basic " + apiKey
};

var optionsNoticia = {
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

var optionsEventos = {
  method: "POST",
  url: "https://onesignal.com/api/v1/notifications",
  headers: headers,
  json: true,
  body: {
    app_id: appId,
    contents: {
      en: "Um novo evento foi adicionado!"
    },
    included_segments: ["All"]
  }
};




// Define a função que será executada periodicamente
const checkForChangesNoticia = async () => {
  // Recupera a referência da coleção desejada
  const collectionRef = db.collection("Noticia");
  //lastDocsLength = valor do documento que guarda o tamanho da coleção anteriormente
  retrieveLastDocsLengthNoticia();
  console.log(`variavel interna ultima contagem de documentos noticia: ${lastDocsLengthNoticia}`);
  
  // Verifica se houve alguma mudança na coleção
  const snapshot = await collectionRef.get();
  const docs = snapshot.docs;
  console.log(`leitura pela função noticia ${docs.length}`);
  if (docs.length > lastDocsLengthNoticia) {
    request(optionsNoticia, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.error("Failed to send notification:", error);
      }
    });

    // Atualiza a quantidade de documentos na última verificação
    lastDocsLengthNoticia = docs.length;
    console.log(`variavel noticia interna apos atualização ${lastDocsLengthNoticia}`);
    await db.collection('Noticia').doc('LastDocsLength').set({ value: lastDocsLengthNoticia });
  }
  if (docs.length < lastDocsLengthNoticia) {
    lastDocsLengthNoticia = docs.length;
    await db.collection('Noticia').doc('LastDocsLength').set({ value: lastDocsLengthNoticia });
  }
};
// Define a função que será executada periodicamente
const checkForChangesEventos = async () => {
  // Recupera a referência da coleção desejada
  const collectionRef = db.collection("Eventos");
  //lastDocsLength = valor do documento que guarda o tamanho da coleção anteriormente
  retrieveLastDocsLengthEventos();
  console.log(`variavel interna ultima contagem de documentos eventos: ${lastDocsLengthEventos}`);
  
  // Verifica se houve alguma mudança na coleção
  const snapshot = await collectionRef.get();
  const docs = snapshot.docs;
  console.log(`leitura pela função Eventos ${docs.length}`);
  if (docs.length > lastDocsLengthEventos) {
    request(optionsEventos, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.error("Failed to send notification:", error);
      }
    });

    // Atualiza a quantidade de documentos na última verificação
    lastDocsLengthEventos = docs.length;
    console.log(`variavel eventos interna apos atualização ${lastDocsLengthEventos}`);
    await db.collection('Eventos').doc('LastDocsLength').set({ value: lastDocsLengthEventos });
  }
  if (docs.length < lastDocsLengthEventos) {
    lastDocsLengthEventos = docs.length;
    await db.collection('Eventos').doc('LastDocsLength').set({ value: lastDocsLengthEventos });
  }
};

// Define o intervalo de tempo para verificação de mudanças (em milissegundos)
const intervalTime = 10000;

// Inicia o loop de verificação de mudanças
setInterval(checkForChangesNoticia, intervalTime);
setInterval(checkForChangesEventos, intervalTime);

