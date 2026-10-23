// 1) Registrati su themoviedb.org, poi Impostazioni > API e copia la "API Key" (v3)
const TMDB_KEY = "aaa3c73bc331555f7afd5839a1031488";



const stato = document.querySelector("#film-stato");
const griglia = document.querySelector("#film-griglia");
const formRicerca = document.querySelector("#form-ricerca");
const inputQuery = document.querySelector("#query");
const URL_IMMAGINI = "https://image.tmdb.org/t/p/";
const NUMERO_FILM = 10;
const CHIAVE_STORAGE = "listaFilm";

const ulLista = document.querySelector("#lista-film");
const messaggioVuoto = document.querySelector("#lista-vuota");
const contatore = document.querySelector("#lista-contatore");

async function cercaFilm(testo) {
  const url =
    `https://api.themoviedb.org/3/search/movie` +
    `?api_key=${TMDB_KEY}&language=it-IT&include_adult=false` +
    `&query=${encodeURIComponent(testo)}`;

  stato.textContent = "Ricerca in corso…";
  stato.classList.remove("errore");
  griglia.innerHTML = "";

  try {
    const risposta = await fetch(url);
    if (!risposta.ok)
      throw new Error(`Errore dal server TMDB (codice ${risposta.status})`);
    const dati = await risposta.json();

    if (dati.results.length === 0) {
      stato.textContent = `Nessun risultato per "${testo}".`;
      return;
    }

    stato.textContent = `${dati.total_results} risultati per "${testo}" (mostro i primi ${Math.min(dati.results.length, 10)})`;
    dati.results
      .slice(0, 10)
      .forEach((film) => griglia.appendChild(creaCard(film)));
  } catch (errore) {
    stato.textContent = `Ricerca non riuscita: ${errore.message}`;
    stato.classList.add("errore");
  }
}

formRicerca.addEventListener("submit", (event) => {
  event.preventDefault(); // evita il ricaricamento della pagina
  const testo = inputQuery.value.trim();
  if (testo !== "") cercaFilm(testo);
});
 function leggiLista() {
      try {
        const dati = JSON.parse(localStorage.getItem(CHIAVE_STORAGE));
        if (!Array.isArray(dati)) return [];
        // scarto eventuali voci malformate (dati vecchi o modificati a mano)
        return dati.filter(
          (f) => f && typeof f.id === "number" && typeof f.title === "string"
        );
      } catch (errore) {
        return []; // JSON non valido o localStorage non disponibile
      }
    }

    let lista = leggiLista();

    function salvaLista() {
      try {
        localStorage.setItem(CHIAVE_STORAGE, JSON.stringify(lista));
      } catch (errore) {
        console.warn("Impossibile salvare la lista:", errore);
      }
    }

    function inLista(id) {
      return lista.some((f) => f.id === id);
    }

    function aggiungiAllaLista(film) {
      if (inLista(film.id)) return; // niente doppioni

      // salvo solo i campi che servono
      lista.push({
        id: film.id,
        title: film.title,
        release_date: film.release_date,
        poster_path: film.poster_path,
      });

      salvaLista();
      disegnaLista();
      aggiornaBottoni();
    }

    function eliminaDallaLista(id) {
      const indice = lista.findIndex((f) => f.id === id);
      if (indice === -1) return;

      lista.splice(indice, 1); // tolgo dall'array
      salvaLista();            // aggiorno il localStorage
      disegnaLista();          // aggiorno la pagina
      aggiornaBottoni();       // il bottone sulla card torna attivo
    }

    /* ================================================================
       UTILITÀ
       ================================================================ */
    function formattaData(dataIso) {
      if (!dataIso) return "Data non disponibile";
      return new Date(dataIso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    /* ================================================================
       LISTA A SCHERMO
       ================================================================ */
    function creaVoceLista(film) {
      const li = document.createElement("li");
      li.classList.add("lista-voce");

      let mini;
      if (film.poster_path) {
        mini = document.createElement("img");
        mini.src = `${URL_IMMAGINI}w92${film.poster_path}`;
        mini.alt = `Locandina di ${film.title}`;
      } else {
        mini = document.createElement("div");
      }
      mini.classList.add("lista-mini");

      const testo = document.createElement("div");
      testo.classList.add("lista-testo");

      const titolo = document.createElement("span");
      titolo.classList.add("lista-titolo");
      titolo.textContent = film.title;

      const data = document.createElement("span");
      data.classList.add("lista-data");
      data.textContent = formattaData(film.release_date);

      

      const deleteBtn = document.createElement("button");
      
      testo.append(titolo, data, deleteBtn);
      
      deleteBtn.type = "button";
      deleteBtn.classList.add("lista-elimina");
      deleteBtn.innerHTML =`<i class="fa-solid fa-trash"></i>`; //probabilmente non ne vale la pena 
      deleteBtn.addEventListener("click", () => eliminaDallaLista(film.id));

      li.append(mini, testo);
      return li;
    }

    function disegnaLista() {
      ulLista.innerHTML = ""; // svuoto e ricostruisco dall'array
      lista.forEach((film) => ulLista.appendChild(creaVoceLista(film)));

      messaggioVuoto.hidden = lista.length > 0;
      contatore.textContent = lista.length;
    }

    /* ================================================================
       CARD DEI FILM
       ================================================================ */
    function impostaBottone(btn) {
      const presente = inLista(Number(btn.dataset.id));
      btn.disabled = presente;
      btn.textContent = presente ? "✓ Nella lista" : "+ Aggiungi alla lista";
    }

    function aggiornaBottoni() {
      document.querySelectorAll(".film-btn").forEach(impostaBottone);
    }

    function creaCard(film) {
      const card = document.createElement("article");
      card.classList.add("film-card");

      // Il link contiene locandina e testi (il bottone resta fuori: un
      // <button> dentro un <a> non è HTML valido e il click aprirebbe il link)
      const link = document.createElement("a");
      link.classList.add("film-link");
      link.href = `https://www.themoviedb.org/movie/${film.id}`;
      link.target = "_blank";
      link.rel = "noopener";

      // Locandina: se manca, uso un riquadro con il titolo
      let poster;
      if (film.poster_path) {
        poster = document.createElement("img");
        poster.classList.add("film-poster");
        poster.src = `${URL_IMMAGINI}w342${film.poster_path}`;
        poster.alt = `Locandina di ${film.title}`;
        poster.loading = "lazy";
      } else {
        poster = document.createElement("div");
        poster.classList.add("film-poster", "film-poster--vuoto");
        poster.textContent = film.title;
      }

      const info = document.createElement("div");
      info.classList.add("film-info");

      const titolo = document.createElement("h3");
      titolo.classList.add("film-titolo");
      titolo.textContent = film.title;

      const data = document.createElement("span");
      data.classList.add("film-data");
      data.textContent = formattaData(film.release_date);

      info.append(titolo, data);

      // Il voto 0 significa "ancora nessun voto"
      if (film.vote_average > 0) {
        const voto = document.createElement("span");
        voto.classList.add("film-voto");
        voto.textContent = `★ ${film.vote_average.toFixed(1)} TMDB`;
        info.appendChild(voto);
      }

      link.append(poster, info);

      // Bottone: aggiunge il film alla lista
      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("film-btn");
      btn.dataset.id = film.id;
      btn.addEventListener("click", () => aggiungiAllaLista(film));
      impostaBottone(btn); // testo e stato iniziali (es. già in lista dopo un ricaricamento)

      card.append(link, btn);
      return card;
    }

    /* ================================================================
       CARICAMENTO DA TMDB
       ================================================================ */
    async function caricaUltimiFilm() {
      if (TMDB_KEY.startsWith("INSERISCI")) {
        stato.textContent = "Inserisci la tua chiave API di TMDB nella costante TMDB_KEY dello script.";
        stato.classList.add("errore");
        return;
      }

      // Data di oggi nel formato "2026-10-23", confrontabile come stringa
      const oggi = new Date().toISOString().slice(0, 10);
      const url =
        `https://api.themoviedb.org/3/movie/now_playing` +
        `?api_key=${TMDB_KEY}&language=it-IT&region=IT&page=1`;

      try {
        const risposta = await fetch(url);
        if (!risposta.ok) {
          throw new Error(`Errore dal server TMDB (codice ${risposta.status})`);
        }
        const dati = await risposta.json();

        const ultimi = dati.results
          .filter((f) => f.release_date && f.release_date <= oggi) // già usciti
          .sort((a, b) => b.release_date.localeCompare(a.release_date)) // dal più recente
          .slice(0, NUMERO_FILM);

        if (ultimi.length === 0) {
          stato.textContent = "Nessun film trovato.";
          return;
        }

        stato.remove();
        ultimi.forEach((film) => griglia.appendChild(creaCard(film)));
      } catch (errore) {
        stato.textContent = `Impossibile caricare i film: ${errore.message}`;
        stato.classList.add("errore");
      }
    }

    // Avvio: prima la lista salvata, poi i film
    disegnaLista();
    caricaUltimiFilm();