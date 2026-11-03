# API pavyzdziai

Siuos pavyzdzius galima naudoti su VS Code REST Client, Thunder Client arba Postman.

## Prisijungimas

```http
POST http://localhost:3000/api/login
Content-Type: application/json
X-Client-Name: TaskFlow-FE

{
  "username": "studentas",
  "password": "slaptazodis"
}
```

## Gauti uzduotis su query parametrais

```http
GET http://localhost:3000/api/tasks?status=active&priority=high&search=planas
Authorization: Bearer taskflow-demo-token
X-Client-Name: TaskFlow-FE
```

## Sukurti uzduoti

```http
POST http://localhost:3000/api/tasks
Content-Type: application/json
Authorization: Bearer taskflow-demo-token
X-Client-Name: TaskFlow-FE

{
  "title": "Nauja uzduotis",
  "description": "Aprasymas atsiskaitymui",
  "priority": "medium",
  "deadline": "2026-06-10"
}
```

## Atnaujinti uzduoti

```http
PUT http://localhost:3000/api/tasks/1
Content-Type: application/json
Authorization: Bearer taskflow-demo-token
X-Client-Name: TaskFlow-FE

{
  "title": "Atnaujinta uzduotis",
  "description": "Pilnas uzduoties atnaujinimas",
  "priority": "high",
  "deadline": "2026-06-12",
  "status": "active"
}
```

## Pakeisti statusa

```http
PATCH http://localhost:3000/api/tasks/1/status
Content-Type: application/json
Authorization: Bearer taskflow-demo-token
X-Client-Name: TaskFlow-FE

{
  "status": "done"
}
```

## Istrinti uzduoti

```http
DELETE http://localhost:3000/api/tasks/1
Authorization: Bearer taskflow-demo-token
X-Client-Name: TaskFlow-FE
```
