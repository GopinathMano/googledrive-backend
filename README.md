# googledrive-backend

GET http://localhost:8080/ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjA2NTkxZjg4M2I5MWMyOTkwOGNjMzhlIiwiZW1haWwiOiJhbmlrZXRkZXZhcmthcjk4QGdtYWlsLmNvbSIsImlhdCI6MTYxNzI3MDM2NH0.D0PRqTVimlCC3syxQaqhB4ea1Fch5iopSDJ4lx5bdeY ###

POST http://localhost:8080/register Content-Type: application/json

{
"email":"gopimano4242@gmail.com", "firstName": "gopi", "lastName": "mano", "password": "1234"
}

### POST http://localhost:8080/login Content-Type: application/json

{
"email":"gopimano4242@gmail.com", "password": "1234"
}

### PUT http://localhost:8080/forgotpassword Content-Type: application/json

{
"email":"gopimano4242@gmail.com"
}

### PUT http://localhost:8080/forgotpassword/resetpassword Content-Type: application/json

{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuaWtldGRldmFya2FyOThAZ21haWwuY29tIiwiaWF0IjoxNjE3MjgyNzIxfQ.mZqOrLtlrf4_sSEcfaRBO6wb59xhpwnPGvXWUxocugk", "newPassword":"abcd"
}
