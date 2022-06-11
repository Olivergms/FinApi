const express = require('express')
const { v4: uuidv4 }  = require('uuid')

const app  = express();


app.use(express.json());

const customers = [];
/**
 * cpf string
 * name string
 * id uuid
 * statement []
 */
app.post("/account" , (request, response) => {
    const { cpf, name } = request.body;

    //valida o cpf, caso exista, retorna true
    const customerAlreadyExists = customers.some(
        // '===' compara o tipo e se o valor é igual 
        (customer) => customer.cpf === cpf
    );

    //se existir, não criará conta
    if(customerAlreadyExists) return response
    .status(400).json( {error: "Custom already exist!"})

    customers.push({
        cpf,
        name,
        id : uuidv4(),
        statement : []
    })

    response.status(201).send();
})


app.listen(3333);