const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const Branch = require('../models/branch');
const Customer = require('../models/customers');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jpmcbank';

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Clear existing data
        await Branch.deleteMany({});
        await Customer.deleteMany({});
        console.log('Cleared existing data');

        // Create branches
        const branches = [
            {
                branchName: 'Main Branch',
                ifscCode: 'JPMC0001',
                address: '123 Main Street, Mumbai',
                branchManager: 'Rajesh Kumar',
                contactDetails: '+91-22-1234-5678'
            },
            {
                branchName: 'Delhi Branch',
                ifscCode: 'JPMC0002',
                address: '456 Ring Road, New Delhi',
                branchManager: 'Priya Singh',
                contactDetails: '+91-11-9876-5432'
            },
            {
                branchName: 'Bangalore Branch',
                ifscCode: 'JPMC0003',
                address: '789 MG Road, Bangalore',
                branchManager: 'Amit Patel',
                contactDetails: '+91-80-5555-1111'
            }
        ];

        const createdBranches = await Branch.insertMany(branches);
        console.log(`Created ${createdBranches.length} branches`);

        // Create employees
        const employees = [
            {
                name: 'employee1',
                email: 'employee1@bank.com',
                mobile: '9876543210',
                password: 'emp@123',
                role: 'employee',
                branch: createdBranches[0]._id,
                gender: 'Male',
                availableBalance: 0
            },
            {
                name: 'employee2',
                email: 'employee2@bank.com',
                mobile: '9876543211',
                password: 'emp@123',
                role: 'employee',
                branch: createdBranches[1]._id,
                gender: 'Female',
                availableBalance: 0
            }
        ];

        // Create customers with test data
        const customers = [
            {
                name: 'alice',
                email: 'alice@example.com',
                mobile: '9123456780',
                password: 'password123',
                role: 'customer',
                branch: createdBranches[0]._id,
                gender: 'Female',
                accountType: 'Savings',
                availableBalance: 50000
            },
            {
                name: 'bob',
                email: 'bob@example.com',
                mobile: '9123456781',
                password: 'password123',
                role: 'customer',
                branch: createdBranches[0]._id,
                gender: 'Male',
                accountType: 'Current',
                availableBalance: 100000
            },
            {
                name: 'charlie',
                email: 'charlie@example.com',
                mobile: '9123456782',
                password: 'password123',
                role: 'customer',
                branch: createdBranches[1]._id,
                gender: 'Male',
                accountType: 'Savings',
                availableBalance: 75000
            },
            {
                name: 'diana',
                email: 'diana@example.com',
                mobile: '9123456783',
                password: 'password123',
                role: 'customer',
                branch: createdBranches[2]._id,
                gender: 'Female',
                accountType: 'Savings',
                availableBalance: 120000
            }
        ];

        // Combine employees and customers
        const allUsers = [...employees, ...customers];
        const createdUsers = await Customer.insertMany(allUsers);
        console.log(`Created ${createdUsers.length} users (${employees.length} employees, ${customers.length} customers)`);

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('Test Credentials:');
        console.log('--- Customers ---');
        console.log('Email: alice@example.com | Password: password123');
        console.log('Email: bob@example.com | Password: password123');
        console.log('Email: charlie@example.com | Password: password123');
        console.log('Email: diana@example.com | Password: password123');
        console.log('\n--- Employees ---');
        console.log('Email: employee1@bank.com | Password: emp@123');
        console.log('Email: employee2@bank.com | Password: emp@123');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
