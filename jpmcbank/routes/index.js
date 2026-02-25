var express = require('express');
var router = express.Router();
var Branch = require('../models/branch');
var Customer = require('../models/customers');

//creating the branch
router.post('/branches', async (req, res) => {
  const branch = new Branch(req.body);
  await branch.save();
  res.status(201).send(branch);
});

//retreiving all branches
router.get('/branches', async (req, res) => {
  const branches = await Branch.find();
  res.status(200).send(branches);
});

//retrieve branch by id

router.get('/branch/:id', async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).send({ message: 'Branch not found' });
  }
  res.status(200).send(branch);
})

//create employee
router.post('/employee', async (req, res) => {
  const employee = new Customer(req.body);
  await employee.save();
  res.status(201).send(employee);
});

//get the details of the employee by id
router.get('/employee/:id', async (req, res) => {

  const employee = await Customer.findById(req.params.id);
  if (!employee) {
    return res.status(404).send({ message: 'Employee not found' });
  }
  res.status(200).send(employee);

});

//retrieve all employees
router.get('/employees', async (req, res) => {
  const employees = await Customer.find({ role: 'employee' });
  res.status(200).send(employees);
});
//manage employee
router.put('/employee/:id', async (req, res) => {
  const employee = await Customer.findByIdAndUpdate(req.params.id);

  if (!employee) {
    return res.status(404).send({ message: 'Employee not found' });
  }
  employee.set(req.body);
  await employee.save();
  res.status(200).send(employee);
  });

//retrieve all employees in a branch

router.get('/employees/:branchid', async (req, res) => {

  const users = await Customer.find({ branch: req.params.branchid });
  //if role is employee than only return
   const employees= users.filter((emp)=>emp.role=="employee")
  res.status(200).json(employees);
})


router.get('/findallcustomers/:branchid', async (req, res) => {

  const Customers = await Customer.find({ branch: req.params.branchid });
  res.status(200).json(Customers);

})

//get the details of the branch by id
router.get('/branches/stats', async (req, res) => {
  const stats = await Branch.aggregate([
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: 'branch',
        as: 'customers'
      }
    },
    {
      $project: {
        branchName: 1,
        customerCount: { $size: '$customers' },
        totalNetValue: { $sum: '$customers.availableBalance' }
      }
    }
  ]);
  res.status(200).send(stats);
});




module.exports = router;
