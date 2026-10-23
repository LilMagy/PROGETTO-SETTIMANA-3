##La mia Watchlist

Una semplice applicazione web che permette di creare e gestire una watchlist personale e dinamica di film. Cerca i film tramite [The Movie Database (TMDB)](https://www.themoviedb.org/), componi la tua lista e tieni traccia di ciò che hai già visto.

#Funzionalità

- Ricerca film: cerca titoli nel catalogo TMDB e visualizza i risultati in italiano, con locandina, anno di uscita e voto medio (se disponibili- in base all'aggiornamento periodico del database di TMDB).
- Gestione della watchlist: aggiungi film, rimuovili dalla lista e contrassegnali come *visti* o *da vedere*.
- Filtri dinamici: filtra la lista mentre scrivi il titolo oppure mostra tutti i film, solo quelli visti o solo quelli da vedere.
- Ordinamento: organizza i film in vari modi: per data di aggiunta, titolo dalla A alla Z, anno di uscita più recente o voto più alto.
- Statistiche: fornisce il numero totale di film, quanti ne hai visti e quanti devi ancora vedere, con barre di avanzamento per dare un senso di progressione.
- Tema chiaro e scuro: scegli il tema dell'interfaccia; la preferenza viene ricordata.
- Salvataggio locale: watchlist e tema vengono salvati nel `localStorage` del browser, così restano disponibili alle visite successive sullo stesso browser e dispositivo.

#Tecnologie utilizzate

- HTML5 per la struttura della pagina.
- CSS3 per la presentazione grafica (file `style.css`).
- JavaScript per ricerca, rendering dinamico, filtri, ordinamento e gestione dei dati.
- TMDB API per recuperare informazioni sui film.
- Font Awesome per l'icona della ricerca.
- Web Storage API (`localStorage`) per conservare le preferenze e la lista localmente.


#Configurazione di TMDB

La web app usa l'endpoint di ricerca film di TMDB. Per eseguire le ricerche è necessaria una chiave API.

1. Crea un account su [TMDB](https://www.themoviedb.org/) e richiedi una chiave API dalle impostazioni del tuo account -- icona in alto a destra #impostazioni #api. Dovrai fornire alcuni dettagli personali perché la key ti venga fornita.
2. Apri `script.js` e individua la costante `TMDB_KEY` nella sezione iniziale di configurazione.
3. Sostituisci il valore attualmente assegnato a `TMDB_KEY` con la tua chiave API, mantenendo le virgolette.
4. Salva il file e ricarica la pagina.



#Come vengono salvati i dati

La watchlist e la preferenza del tema sono memorizzate nel `localStorage` del browser. Questo significa che:

- i dati restano salvati dopo aver chiuso e riaperto il browser;
- i dati non vengono sincronizzati automaticamente con altri dispositivi o browser;
- cancellando i dati del sito dal browser, la watchlist salvata localmente può andare persa.



#Struttura dei file

text
index.html    # Struttura della pagina
style.css     # Stili e temi dell'interfaccia
script.js     # Ricerca TMDB e logica della watchlist
README.md     # Documentazione del progetto


#Crediti e attribuzione
I dati e le immagini dei film sono forniti da TMDB. Questo prodotto utilizza l'API di TMDB, ma non è approvato né certificato da TMDB.

Per maggiori informazioni, consulta il [sito di TMDB](https://www.themoviedb.org/) e la [documentazione ufficiale dell'API](https://developer.themoviedb.org/docs).


I dati e le immagini dei film sono forniti da TMDB. Questo prodotto utilizza l'API di TMDB, ma non è approvato né certificato da TMDB.

Per maggiori informazioni, consulta il [sito di TMDB](https://www.themoviedb.org/) e la [documentazione ufficiale dell'API](https://developer.themoviedb.org/docs).
