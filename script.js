/* ================================================================
   CONFIGURAZIONE
   ================================================================ */
// Chiave API (v3): themoviedb.org > Impostazioni > API
const TMDB_KEY = "aaa3c73bc331555f7afd5839a1031488";

const URL_IMMAGINI = "https://image.tmdb.org/t/p/w92";
const CHIAVE_LISTA = "listaFilm";
const CHIAVE_TEMA = "tema";
const MAX_RISULTATI = 5;

/* ================================================================
   ELEMENTI DELLA PAGINA
   ================================================================ */
const btnTema = document.querySelector("#tema");
const formRicerca = document.querySelector("#form-ricerca");
const inputQuery = document.querySelector("#query");
const elRisultati = document.querySelector("#risultati");
const inputFiltro = document.querySelector("#filtro-testo");
const selectStato = document.querySelector("#filtro-stato");
const selectOrdine = document.querySelector("#ordine");
const elLista = document.querySelector(".lista");
const elNotifica = document.querySelector("#notifica");

/* ================================================================
   LOCALSTORAGE
   ================================================================ */
function leggiStorage(chiave) {
  try {
    return localStorage.getItem(chiave);
  } catch (errore) {
    return null;
  }
}

function scriviStorage(chiave, valore) {
  try {
    localStorage.setItem(chiave, valore);
  } catch (errore) {
    console.warn("Impossibile salvare i dati:", errore);
  }
}

// Legge la lista salvata, scartando JSON rotto e voci incomplete
function caricaLista() {
  try {
    const dati = JSON.parse(leggiStorage(CHIAVE_LISTA));
    if (!Array.isArray(dati)) return [];

    return dati
      .filter((f) => f && typeof f.id === "number" && typeof f.title === "string")
      .map((f) => ({
        id: f.id,
        title: f.title,
        release_date: f.release_date || "",
        poster_path: f.poster_path || null,
        vote_average: Number(f.vote_average) || 0,
        visto: Boolean(f.visto),
        aggiunto: Number(f.aggiunto) || 0,
      }));
  } catch (errore) {
    return [];
  }
}

function salvaLista() {
  scriviStorage(CHIAVE_LISTA, JSON.stringify(stato.lista));
}

/* ================================================================
   STATO (unica fonte di verità: la pagina viene sempre ridisegnata da qui)
   ================================================================ */
const stato = {
  lista: caricaLista(), // film salvati dall'utente
  risultati: [], // ultimi risultati della ricerca su TMDB
  testo: "", // filtro live sul titolo
  filtro: "tutti", // tutti | da-vedere | visti
  ordine: "recenti", // recenti | titolo | anno | voto
};

function filmInLista(id) {
  return stato.lista.some((f) => f.id === id);
}

/* ===== Modifiche allo stato: ognuna salva e richiama render() ===== */
function aggiungiFilm(film) {
  if (filmInLista(film.id)) {
    notifica("Il film è già nella lista", "errore");
    return;
  }

  stato.lista.push({
    id: film.id,
    title: film.title,
    release_date: film.release_date || "",
    poster_path: film.poster_path || null,
    vote_average: Number(film.vote_average) || 0,
    visto: false,
    aggiunto: Date.now(),
  });

  salvaLista();
  render();
  notifica(`"${film.title}" aggiunto alla lista`);
}

function eliminaFilm(id) {
  const indice = stato.lista.findIndex((f) => f.id === id);
  if (indice === -1) return;

  const [rimosso] = stato.lista.splice(indice, 1);
  salvaLista();
  render();
  notifica(`"${rimosso.title}" eliminato`);
}

function cambiaVisto(id) {
  const film = stato.lista.find((f) => f.id === id);
  if (!film) return;

  film.visto = !film.visto;
  salvaLista();
  render();
}

/* ================================================================
   NOTIFICA
   ================================================================ */
let timerNotifica;

function notifica(messaggio, tipo = "info") {
  elNotifica.textContent = messaggio;
  elNotifica.className = `visibile ${tipo}`;

  clearTimeout(timerNotifica);
  timerNotifica = setTimeout(() => {
    elNotifica.classList.remove("visibile");
  }, 2500);
}

/* ================================================================
   RENDER
   ================================================================ */
function descrizione(film) {
  const anno = film.release_date ? film.release_date.slice(0, 4) : "Anno non disponibile";
  return film.vote_average > 0 ? `${anno} · ★ ${film.vote_average.toFixed(1)}` : anno;
}

function creaMini(film) {
  let mini;
  if (film.poster_path) {
    mini = document.createElement("img");
    mini.src = URL_IMMAGINI + film.poster_path;
    mini.alt = "";
  } else {
    mini = document.createElement("div");
  }
  mini.classList.add("mini");
  return mini;
}

// Lista filtrata e ordinata a partire dallo stato (senza modificare stato.lista)
function listaVisibile() {
  const testo = stato.testo.trim().toLowerCase();

  const film = stato.lista.filter((f) => {
    const okTesto = f.title.toLowerCase().includes(testo);
    const okStato =
      stato.filtro === "tutti" ||
      (stato.filtro === "visti" && f.visto) ||
      (stato.filtro === "da-vedere" && !f.visto);
    return okTesto && okStato;
  });

  switch (stato.ordine) {
    case "titolo":
      film.sort((a, b) => a.title.localeCompare(b.title, "it"));
      break;
    case "anno":
      film.sort((a, b) => b.release_date.localeCompare(a.release_date));
      break;
    case "voto":
      film.sort((a, b) => b.vote_average - a.vote_average);
      break;
    default:
      film.sort((a, b) => b.aggiunto - a.aggiunto);
  }

  return film;
}

function creaVoce(film) {
  const li = document.createElement("li");
  li.classList.add("voce");
  if (film.visto) li.classList.add("visto");

  const testo = document.createElement("div");
  testo.classList.add("testo");

  // Titolo e bottone Elimina sulla stessa riga
  const riga = document.createElement("div");
  riga.classList.add("riga");

  const titolo = document.createElement("span");
  titolo.classList.add("titolo");
  titolo.textContent = film.title;

  const btnElimina = document.createElement("button");
  btnElimina.type = "button";
  btnElimina.classList.add("elimina");
  btnElimina.textContent = "Elimina";
  btnElimina.addEventListener("click", () => eliminaFilm(film.id));

  riga.append(titolo, btnElimina);

  const dettagli = document.createElement("span");
  dettagli.classList.add("dettagli");
  dettagli.textContent = descrizione(film);

  const label = document.createElement("label");
  label.classList.add("check");
  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = film.visto;
  check.addEventListener("change", () => cambiaVisto(film.id));
  label.append(check, " Visto");

  testo.append(riga, dettagli, label);
  li.append(creaMini(film), testo);
  return li;
}

function renderLista() {
  elLista.innerHTML = "";

  const film = listaVisibile();

  if (film.length === 0) {
    const vuoto = document.createElement("p");
    vuoto.classList.add("vuoto");
    vuoto.textContent =
      stato.lista.length === 0
        ? "La lista è vuota. Cerca un film per aggiungerlo."
        : "Nessun film corrisponde ai filtri.";
    elLista.appendChild(vuoto);
    return;
  }

  const ul = document.createElement("ul");
  film.forEach((f) => ul.appendChild(creaVoce(f)));
  elLista.appendChild(ul);
}

function renderStatistiche() {
  const totale = stato.lista.length;
  const visti = stato.lista.filter((f) => f.visto).length;
  const daVedere = totale - visti;

  document.querySelector("#stat-totale").textContent = totale;
  document.querySelector("#stat-visti").textContent = visti;
  document.querySelector("#stat-da-vedere").textContent = daVedere;

  document.querySelector("#barra-visti").style.width =
    `${totale ? (visti / totale) * 100 : 0}%`;
  document.querySelector("#barra-da-vedere").style.width =
    `${totale ? (daVedere / totale) * 100 : 0}%`;
}

function renderRisultati() {
  elRisultati.innerHTML = "";

  stato.risultati.forEach((film) => {
    const li = document.createElement("li");
    li.classList.add("risultato");

    const testo = document.createElement("div");
    testo.classList.add("testo");

    const titolo = document.createElement("span");
    titolo.classList.add("titolo");
    titolo.textContent = film.title;

    const dettagli = document.createElement("span");
    dettagli.classList.add("dettagli");
    dettagli.textContent = descrizione(film);

    testo.append(titolo, dettagli);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("aggiungi");
    const presente = filmInLista(film.id);
    btn.disabled = presente;
    btn.textContent = presente ? "Nella lista" : "Aggiungi";
    btn.addEventListener("click", () => aggiungiFilm(film));

    li.append(creaMini(film), testo, btn);
    elRisultati.appendChild(li);
  });
}

function render() {
  renderRisultati();
  renderStatistiche();
  renderLista();
}

/* ================================================================
   RICERCA SU TMDB
   ================================================================ */
async function cercaFilm(testo) {
  if (TMDB_KEY.startsWith("INSERISCI")) {
    notifica("Inserisci la chiave API di TMDB in script.js", "errore");
    return;
  }

  const url =
    `https://api.themoviedb.org/3/search/movie` +
    `?api_key=${TMDB_KEY}&language=it-IT&include_adult=false` +
    `&query=${encodeURIComponent(testo)}`;

  try {
    const risposta = await fetch(url);
    if (!risposta.ok) {
      throw new Error(`codice ${risposta.status}`);
    }
    const dati = await risposta.json();

    stato.risultati = dati.results.slice(0, MAX_RISULTATI);
    render();

    if (stato.risultati.length === 0) {
      notifica(`Nessun risultato per "${testo}"`, "errore");
    }
  } catch (errore) {
    notifica(`Ricerca non riuscita: ${errore.message}`, "errore");
  }
}

formRicerca.addEventListener("submit", (event) => {
  event.preventDefault();

  // Validazione: niente solo spazi, almeno 2 caratteri
  const testo = inputQuery.value.trim();
  if (testo.length < 2) {
    notifica("Scrivi almeno 2 caratteri per cercare", "errore");
    inputQuery.focus();
    return;
  }

  cercaFilm(testo);
});

/* ================================================================
   CONTROLLI: ricerca live, filtro, ordinamento
   ================================================================ */
inputFiltro.addEventListener("input", () => {
  stato.testo = inputFiltro.value;
  render();
});

selectStato.addEventListener("change", () => {
  stato.filtro = selectStato.value;
  render();
});

selectOrdine.addEventListener("change", () => {
  stato.ordine = selectOrdine.value;
  render();
});

/* ================================================================
   TEMA CHIARO / SCURO
   ================================================================ */
function impostaTema(tema) {
  document.documentElement.dataset.tema = tema;
  btnTema.setAttribute("aria-pressed", String(tema === "scuro"));
}

const temaSalvato = leggiStorage(CHIAVE_TEMA);
if (temaSalvato === "scuro" || temaSalvato === "chiaro") {
  impostaTema(temaSalvato);
} else {
  impostaTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "scuro" : "chiaro");
}

btnTema.addEventListener("click", () => {
  const nuovo = document.documentElement.dataset.tema === "scuro" ? "chiaro" : "scuro";
  impostaTema(nuovo);
  scriviStorage(CHIAVE_TEMA, nuovo);
});

/* ================================================================
   AVVIO
   ================================================================ */
document.querySelector("#anno").textContent = new Date().getFullYear();
render();
