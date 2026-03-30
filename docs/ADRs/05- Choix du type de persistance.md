# Choix du type de persistance
Date: 30-03-2026
## Problème
Quel type de solution utiliser pour persister les données de notre application

## Solutions envisagées
- Base de données relationelle
- Base de données NoSQL
- Base de données en temps réel

## Solution gardée
Base de données relationnelle

## Raison
Etant donné la décision d'utiliser une queue, nous n'avons pas besoin d'une base de données en temps réel, et utiliser du NoSQL alors que nous n'avons pas de données non structurées serait un gachis de performance.