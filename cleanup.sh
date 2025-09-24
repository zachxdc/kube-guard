#!/bin/bash

# KubeGuard Cleanup Script
# Removes all KubeGuard components from Kubernetes

echo "🧹 Cleaning up KubeGuard deployment..."

echo "🗑️  Removing deployments..."
kubectl delete deployment kubeguard-agent 2>/dev/null || echo "  Agent deployment not found"
kubectl delete deployment risk-scorer 2>/dev/null || echo "  Risk scorer deployment not found"

echo "🗑️  Removing services..."
kubectl delete service risk-scorer 2>/dev/null || echo "  Risk scorer service not found"

echo "🗑️  Removing config maps..."
kubectl delete configmap kubeguard-config 2>/dev/null || echo "  Config map not found"

echo "✅ Cleanup completed!"
echo "💡 To completely reset, you can also run: minikube delete && minikube start"