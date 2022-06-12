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


//midleware
function verifyIfExistAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find( c => c.cpf === cpf);

    if(!customer) return response
    .status(400)
    .json({error: "Customer not found"});

    request.customer = customer;

    return next();
}

function getBalance(statement) {
    //transforma todas as informações passadas em um único valor
    //acc - acomulador que irá armazenar operação de soma ou subtração
    //operation é o incremento do looping
    //no ultimo parametro é o valor inicial
    const balance =  statement.reduce((acc, operation) =>{
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

app.get("/statement", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
})

app.get("/statement/date", verifyIfExistAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;


    const dateformat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) => 
            statement.created_at.toDateString() === 
            new Date(dateformat).toDateString()
    );

    return response.json(statement);
})

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

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {
    const {description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at : new Date(),
        type: "credit",

    }
    
    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.post('/withdraw', verifyIfExistAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return response.status(400).json({error: "Insufficient funds!"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.listen(3333, () => console.log("Servidor rodando na porta 3333"));