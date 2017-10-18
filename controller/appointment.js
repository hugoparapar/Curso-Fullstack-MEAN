var mongoose = require('mongoose');
var App = require('../models/appointments.js');
var Customer = require('../models/customers.js');
var Pets = require('../models/pets.js');
var moment = require('moment');

function postApp(req,res){
	var app = new App(req.body);
		app.save((err,appStored) =>{
			if(err) return res.status(500).send({message: "Error al guardar la cita"});
			if(!appStored) return res.status(404).send({message: "No se registro la cita"});
			res.status(200).send({app: appStored});	
		});
}
    
function getApp(req,res){
	App.find({})
			.exec(function (err,apps) {
				if(err) return res.status(500).send({message: "Error"});
				res.send(200, apps);			
	});	
}
     
function getAppById(req,res){
	App.findById(req.params.id, (err,app) =>{
		if(err) return res.status(500).send({message: "Error"});
		res.send(200, app);			
	});
}

function updateApp(req,res){
	App.findByIdAndUpdate(req.params.id, req.body, (err,appUpdate) =>{
		if(err)res.status(500).send({message: "Error al actualizar la cita"});
		if(!appUpdate)res.status(404).send({message: "No se puede actualizar la cita"});
		res.send(200, appUpdate);			
	});
}

function getAppByDate(req,res){
	
	var dateStart = moment(req.params.fromdate,"YYYYMMDD");
	var dateEnd = moment( req.params.todate,"YYYYMMDD");

	App.find({dateTimeI: { $gte: dateStart,$lte: dateEnd }
	    },(err, apps) => {
	        if (err) {
	            res.json({ success: false, message: err });
	        } else {
	            res.status(200).send(apps);
	        }
		}).populate({
		            path: 'petId',
		            model: 'Pets',
		            select: 'name specie',
		            populate: {
		                path: 'customerId',
		                model: 'Customer',
		                select: 'firstName lastName'
		            }
		}).sort({ 'dateTime': 1 });

	App.aggregate([
        {
        	
        $project: {
            
        	$date: { $dateToString: { format: "%G-%m-%d", date: "$dateTimeI" } }
         },
        	
            $group: {
            	_id: '$date' 
            }
        }
    ], function (err, result) {
        if (err) {
        	res.json({ success: false, message: err });
        } else {
        	console.log(result);
        	res.json(result);
            
        }
    });
	
	
}

module.exports = {postApp, getApp, getAppById, updateApp, getAppByDate};