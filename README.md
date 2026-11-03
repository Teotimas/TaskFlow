# TaskFlow WEB sistema

TaskFlow yra paprasta uzduociu valdymo sistema, sukurta pagal Interneto technologiju darbo kriterijus.

## Naudojamos technologijos

- Backend: Node.js + Express
- Frontend: HTML + CSS + JavaScript
- Dizainas: Bootstrap
- Duomenu saugojimas: JSON failas `data/tasks.json`

## Kaip paleisti

1. Isidiek Node.js LTS versija.
2. Atidaryk projekta per Visual Studio Code.
3. Terminale paleisk:

```bash
npm install
npm start
```

4. Narsykleje atidaryk:

```text
http://localhost:3000
```

Prisijungimas:

```text
Vartotojas: studentas
Slaptazodis: slaptazodis
```

## Kaip ikelti i cloud

Paprasciausias kelias yra Render:

1. Ikelk projekta i GitHub.
2. Render pasirink `New Web Service`.
3. Pasirink savo GitHub repository.
4. Render pats gali perskaityti `render.yaml`.
5. Paleidus Render duos HTTPS nuoroda, pvz. `https://taskflow-web-system.onrender.com`.

## API metodai

| Metodas | Kelias | Paskirtis |
| --- | --- | --- |
| POST | `/api/login` | Prisijungimas ir token gavimas |
| GET | `/api/tasks?status=active&priority=high&search=planas` | Uzduociu gavimas su query parametrais |
| GET | `/api/tasks/:id` | Vienos uzduoties gavimas pagal path parametra |
| POST | `/api/tasks` | Naujos uzduoties sukurimas |
| PUT | `/api/tasks/:id` | Visos uzduoties atnaujinimas |
| PATCH | `/api/tasks/:id/status` | Tik statuso pakeitimas |
| DELETE | `/api/tasks/:id` | Uzduoties istrynimas |

## Kriteriju atitikimas

- API turi 7 endpointus, o individualiai reikia bent 5.
- Naudojami POST, PUT, PATCH ir DELETE metodai, o reikia bent 2 is siu metodu.
- Naudojami HTTP parametrai:
  - Header: `Authorization`
  - Header: `Content-Type`
  - Header: `X-Client-Name`
  - Query: `status`, `priority`, `search`
  - Path: `:id`
- Duomenys saugomi failu sistemoje: `data/tasks.json`.
- Backend turi autorizacija per `Authorization: Bearer taskflow-demo-token`.
- Backend tikrina custom header `X-Client-Name`.
- Backend turi validacija: tikrina pavadinima, aprasyma, prioriteta, termina ir statusa.
- Frontend naudoja visus pagrindinius API metodus per mygtukus ir formas.
- Frontend yra responsive, nes naudojamas Bootstrap grid ir papildomos CSS taisykles.
- Papildomam balui igyvendinti abu: FE ir BE.

## Ka sakyti per atsiskaityma

Sistema vadinasi TaskFlow. Ji skirta uzduotims kurti, filtruoti, redaguoti, pazymeti kaip atliktas ir trinti.

Backend dalyje Express serveris apdoroja API uzklausas. Visi uzduociu endpointai, isskyrus login, reikalauja `Authorization` headerio. Duomenys nuskaitomi ir issaugomi JSON faile.

Frontend dalyje `fetch()` funkcija kviecia API. Kai vartotojas paspaudzia mygtuka, kvieciamas atitinkamas HTTP metodas: POST sukuria, PUT atnaujina, PATCH pakeicia statusa, DELETE istrina.

Validacija reikalinga tam, kad i sistema nepatektu netinkami duomenys, pvz. tuscias pavadinimas arba neteisingas prioritetas.

Responsive dizainas padarytas su Bootstrap: dideliame ekrane forma ir sarasas yra salia, o telefone jie atsistoja vienas po kitu.
