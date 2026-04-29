const balance=document.getElementById('balance');
const moneyPlus=document.getElementById('money-plus');
const moneyMinus=document.getElementById('money-minus');
const list=document.getElementById('list');
const form=document.getElementById('form');
const text=document.getElementById('text');
const amount=document.getElementById('amount');

const localStorageTransactions=
JSON.parse(
localStorage.getItem('transactions')
) || [];

let transactions=localStorageTransactions;
let chart;

function addTransaction(e){
e.preventDefault();

const transaction={
id:Date.now(),
text:text.value,
amount:Number(amount.value)
};

transactions.push(transaction);

updateLocalStorage();
init();

text.value='';
amount.value='';
}

function addTransactionDOM(transaction){

const li=document.createElement('li');

const sign=
transaction.amount<0 ? '-' : '+';

li.innerHTML=`
${transaction.text}
<div>
<span>${sign}$${Math.abs(transaction.amount)}</span>

<button
class="delete-btn"
onclick="removeTransaction(${transaction.id})">
X
</button>

</div>
`;

list.appendChild(li);
}

function updateValues(){

const amounts=
transactions.map(item=>item.amount);

const total=
amounts.reduce((a,b)=>a+b,0);

const income=
amounts
.filter(item=>item>0)
.reduce((a,b)=>a+b,0);

const expense=
amounts
.filter(item=>item<0)
.reduce((a,b)=>a+b,0);

balance.innerText=`$${total}`;
moneyPlus.innerText=`$${income}`;
moneyMinus.innerText=`$${Math.abs(expense)}`;

drawChart(
income,
Math.abs(expense)
);

}

function removeTransaction(id){

transactions=
transactions.filter(
item=>item.id!==id
);

updateLocalStorage();
init();

}

function updateLocalStorage(){
localStorage.setItem(
'transactions',
JSON.stringify(transactions)
);
}

function drawChart(income,expense){

if(chart){
chart.destroy();
}

chart=
new Chart(
document.getElementById('expenseChart'),
{
type:'pie',
data:{
labels:[
'Income',
'Expenses'
],
datasets:[{
data:[
income,
expense
]
}]
}
}
);

}

function init(){
list.innerHTML='';
transactions.forEach(
addTransactionDOM
);
updateValues();
}

form.addEventListener(
'submit',
addTransaction
);

init();