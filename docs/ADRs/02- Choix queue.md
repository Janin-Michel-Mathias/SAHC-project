# Choix du système de queue utilisé
Date: 30-03-2026
## Problème
Quel type de queue choisir pour gérer la priorité et les race conditions de ce projet

## Solutions envisagées
- Utiliser une queue déjà prête (Ex: Kafka, RabbitMQ, ...)
- Réaliser une queue dans une api REST

## Solution gardée
Réaliser une queue dans une api REST NestJS

## Raison
Etant donné le temps imparti dans ce projet et le fait que les développeurs de l'équipe n'ont jamais été formés à l'utilisation de systèmes de queue, il a été décidé de rester sur des technologies que l'équipe connait déjà.