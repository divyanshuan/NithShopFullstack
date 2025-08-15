#!/bin/bash

echo "🗑️  Dropping database nithshop_db..."
docker exec mysql-container mysql -u divyanshuan -pdivyanshuan -e "DROP DATABASE IF EXISTS nithshop_db;"

echo "🆕 Creating new database nithshop_db..."
docker exec mysql-container mysql -u divyanshuan -pdivyanshuan -e "CREATE DATABASE nithshop_db;"

echo "✅ Database reset complete!"
echo "📊 Current databases:"
docker exec mysql-container mysql -u divyanshuan -pdivyanshuan -e "SHOW DATABASES;"
