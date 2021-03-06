var mongoose = require('mongoose');
var Customer = require('../models/customers.js');
const Q = require("q");
const Validators = require("../public/app/validation/validators.js");


function postCustomer(req,res){
	var customer = new Customer(req.body);

/*	Prueba Validators
 * const validationErrors = Validators.validateCustomer(customer); 
	if(validationErrors) { return res.status(400).send(validationErrors); }*/
	
		customer.save((err,customerStored) =>{
			if(err) return res.status(500).send({message: "Error al guardar el cliente"});
			if(!customerStored) return res.status(404).send({message: "No se registro el cliente"});
			res.json(customerStored);	
		});
}

function getCustomers(req,res){
	Customer.find({})
			.select('lastName firstName dni')
			.exec(function (err,customers) {
				if(err) return res.status(500).send({message: "Error"});
				res.json(customers);			
	});	
}

//Prueba promesas en el servidor
function getCustomerById (id)  {
	var promesa = Q.defer();
	
	Customer.findById(id, function(err, customer) {
		if (err) {
			console.error(err);
			promesa.reject(err);
		} else {
			promesa.resolve(customer);
		}
	});
	
	return promesa.promise;
}


//Prueba OptimisticLocking 
function update(json){
	
 	var promesa = Q.defer();	
 	var v = json.__v;
 	delete json.__v; // evitamos el conflicto entre $set e $inc
 		
 		Customer.findOneAndUpdate(
 				{_id: json._id, __v: v}, // find current version
 				{$set: json, $inc: { __v: 1 }}, // update and increment version
 				{new : true}, // return inserted version
 		function(err, customerUpdate) {
 	 		console.log("Updated Customer:", customerUpdate);
 	 		if (err) {
 	 			console.error(err);
 	 			promesa.reject(err);
 	 		} else {
 	 			promesa.resolve(customerUpdate);
 	 		}
 	 	});	
 	 	
 	 	return promesa.promise;
 }

/*function updateCustomer(req,res){
	Customer.findByIdAndUpdate(req.params.id, req.body, (err,customerUpdate) =>{
		if(err)res.status(500).send({message: "Error al actualizar el cliente"});
		if(!customerUpdate)res.status(404).send({message: "No se puede actualizar el cliente"});
		res.json(customerUpdate);			
	});
}*/

module.exports = {postCustomer, getCustomers, getCustomerById, update};