#!/usr/bin/env python3
"""
Quick test script for Stock Screener API
"""
import sys
import os
import subprocess
import requests
import time
from threading import Thread

def test_api():
    """Test the API endpoints"""
    print("🧪 Testing Stock Screener API...")
    
    base_url = 'http://localhost:5001/api'
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    try:
        # Test health endpoint
        print("\n1. Testing health endpoint...")
        response = requests.get(f'{base_url}/health')
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        # Test filters endpoint
        print("\n2. Testing filters endpoint...")
        response = requests.get(f'{base_url}/screener/filters')
        print(f"   Status: {response.status_code}")
        filters = response.json()
        print(f"   Available filters: {list(filters['filters'].keys())}")
        
        # Test screening with quality stocks
        print("\n3. Testing quality stocks screening...")
        response = requests.get(f'{base_url}/screener/screen/quality_stocks')
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if data['status'] == 'success':
            stocks = data['data']['stocks']
            print(f"   ✅ Found {len(stocks)} quality stocks:")
            for i, stock in enumerate(stocks[:3], 1):  # Show first 3
                print(f"      {i}. {stock['name']} - ₹{stock['currentPrice']:.2f}")
        else:
            print(f"   ❌ Error: {data['message']}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Make sure the Flask server is running on localhost:5001")

if __name__ == "__main__":
    test_api()