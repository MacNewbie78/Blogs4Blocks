#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class BlogsAPITester:
    def __init__(self, base_url="https://marketing-forum-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_post_id = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response text: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log(f"❌ FAILED - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_categories_endpoint(self):
        """Test GET /api/categories - should return 7 categories with post counts"""
        success, data = self.run_test(
            "GET /api/categories",
            "GET", 
            "api/categories",
            200
        )
        
        if success and data:
            if len(data) == 7:
                self.log(f"✅ Found correct number of categories: {len(data)}")
                # Check if categories have required fields
                for cat in data:
                    required_fields = ['slug', 'name', 'description', 'color', 'post_count']
                    if all(field in cat for field in required_fields):
                        self.log(f"   Category '{cat['name']}' has {cat['post_count']} posts")
                    else:
                        self.log(f"❌ Category missing fields: {cat}")
                        return False
                return True
            else:
                self.log(f"❌ Expected 7 categories, got {len(data)}")
                return False
        return success

    def test_posts_endpoint(self):
        """Test GET /api/posts - should return 12 seeded posts"""
        success, data = self.run_test(
            "GET /api/posts",
            "GET",
            "api/posts", 
            200
        )
        
        if success and data:
            posts = data.get('posts', [])
            total = data.get('total', 0)
            self.log(f"✅ Found {len(posts)} posts, total: {total}")
            if len(posts) >= 12:
                self.log(f"✅ Seeded posts found")
                # Store first post ID for later tests
                if posts and len(posts) > 0:
                    self.created_post_id = posts[0]['id']
                return True
            else:
                self.log(f"❌ Expected at least 12 posts, got {len(posts)}")
                return False
        return success

    def test_post_detail(self):
        """Test GET /api/posts/{id} - get specific post"""
        if not self.created_post_id:
            self.log("❌ No post ID available for detail test")
            return False
            
        success, data = self.run_test(
            f"GET /api/posts/{self.created_post_id}",
            "GET",
            f"api/posts/{self.created_post_id}",
            200
        )
        
        if success and data:
            required_fields = ['id', 'title', 'content', 'author_name', 'category_slug', 'likes', 'views']
            if all(field in data for field in required_fields):
                self.log(f"✅ Post detail has all required fields")
                self.log(f"   Title: {data['title'][:50]}...")
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Post missing fields: {missing}")
        return success

    def test_user_registration(self):
        """Test POST /api/auth/register"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test_{timestamp}@blogs4blocks.com",
            "password": "TestPass123!",
            "city": "New York",
            "country": "United States"
        }
        
        success, data = self.run_test(
            "POST /api/auth/register",
            "POST",
            "api/auth/register",
            200,
            test_user
        )
        
        if success and data:
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['id']
                self.log(f"✅ User registered successfully: {data['user']['name']}")
                return True
            else:
                self.log(f"❌ Registration response missing token or user")
        return success

    def test_user_login(self):
        """Test POST /api/auth/login"""
        if not self.user_id:
            self.log("❌ No registered user to login with")
            return False
            
        # Create a new user for login test
        timestamp = datetime.now().strftime("%H%M%S") + "2"
        test_user = {
            "name": f"Login Test {timestamp}",
            "email": f"login_{timestamp}@blogs4blocks.com", 
            "password": "LoginPass123!",
            "city": "Boston",
            "country": "United States"
        }
        
        # Register first
        reg_success, reg_data = self.run_test(
            "Register user for login test",
            "POST",
            "api/auth/register", 
            200,
            test_user
        )
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        success, data = self.run_test(
            "POST /api/auth/login",
            "POST",
            "api/auth/login",
            200,
            login_data
        )
        
        if success and data:
            if 'token' in data and 'user' in data:
                self.log(f"✅ Login successful: {data['user']['name']}")
                return True
            else:
                self.log(f"❌ Login response missing token or user")
        return success

    def test_create_post(self):
        """Test POST /api/posts - create new post"""
        if not self.token:
            self.log("❌ No auth token for post creation")
            return False
            
        post_data = {
            "title": f"Test Marketing Post {datetime.now().strftime('%H:%M:%S')}",
            "content": "This is a test post about marketing strategies.\n\n**Key Points:**\n- Test point 1\n- Test point 2\n\nThis post tests the API functionality.",
            "excerpt": "A test post to verify the API is working correctly",
            "category_slug": "social-media",
            "subcategory": "content-marketing", 
            "tags": ["test", "api", "marketing"]
        }
        
        success, data = self.run_test(
            "POST /api/posts (create post)",
            "POST",
            "api/posts",
            200,
            post_data
        )
        
        if success and data:
            if 'id' in data and 'title' in data:
                self.created_post_id = data['id']
                self.log(f"✅ Post created successfully: {data['title']}")
                return True
            else:
                self.log(f"❌ Post creation response missing id or title")
        return success

    def test_like_post(self):
        """Test POST /api/posts/{id}/like"""
        if not self.created_post_id:
            self.log("❌ No post ID for like test")
            return False
            
        success, data = self.run_test(
            f"POST /api/posts/{self.created_post_id}/like",
            "POST",
            f"api/posts/{self.created_post_id}/like",
            200
        )
        
        if success and data:
            if 'likes' in data:
                self.log(f"✅ Post liked successfully, now has {data['likes']} likes")
                return True
            else:
                self.log(f"❌ Like response missing likes count")
        return success

    def test_create_comment(self):
        """Test POST /api/posts/{id}/comments"""
        if not self.created_post_id:
            self.log("❌ No post ID for comment test")
            return False
            
        comment_data = {
            "content": "This is a test comment to verify the commenting system works correctly."
        }
        
        success, data = self.run_test(
            f"POST /api/posts/{self.created_post_id}/comments",
            "POST", 
            f"api/posts/{self.created_post_id}/comments",
            200,
            comment_data
        )
        
        if success and data:
            if 'id' in data and 'content' in data:
                self.log(f"✅ Comment created successfully")
                return True
            else:
                self.log(f"❌ Comment creation response missing id or content")
        return success

    def test_get_comments(self):
        """Test GET /api/posts/{id}/comments"""
        if not self.created_post_id:
            self.log("❌ No post ID for get comments test")  
            return False
            
        success, data = self.run_test(
            f"GET /api/posts/{self.created_post_id}/comments",
            "GET",
            f"api/posts/{self.created_post_id}/comments",
            200
        )
        
        if success and isinstance(data, list):
            self.log(f"✅ Retrieved {len(data)} comments")
            return True
        return success

    def test_guest_post_creation(self):
        """Test creating a guest post without authentication"""
        # Clear token to test guest functionality
        old_token = self.token
        self.token = None
        
        guest_post_data = {
            "title": f"Guest Marketing Insight {datetime.now().strftime('%H:%M:%S')}",
            "content": "This is a guest post about global marketing trends.\n\n**Guest Perspective:**\n- Authentic local insights\n- Real market experience\n\nGuest posts expire after 30 days.",
            "excerpt": "A guest perspective on international marketing",
            "category_slug": "consumer-behavior",
            "tags": ["guest", "global", "insights"],
            "guest_author": {
                "name": "Test Guest Author",
                "city": "San Francisco", 
                "country": "United States"
            }
        }
        
        success, data = self.run_test(
            "POST /api/posts (guest post)",
            "POST",
            "api/posts",
            200,
            guest_post_data
        )
        
        # Restore token
        self.token = old_token
        
        if success and data:
            if 'id' in data and data.get('is_guest'):
                self.log(f"✅ Guest post created successfully")
                return True
            else:
                self.log(f"❌ Guest post creation response invalid")
        return success

    def test_stats_endpoint(self):
        """Test GET /api/stats"""
        success, data = self.run_test(
            "GET /api/stats",
            "GET",
            "api/stats", 
            200
        )
        
        if success and data:
            required_stats = ['total_posts', 'total_comments', 'total_users', 'countries_represented']
            if all(stat in data for stat in required_stats):
                self.log(f"✅ Stats endpoint working:")
                for stat in required_stats:
                    self.log(f"   {stat}: {data[stat]}")
                return True
            else:
                missing = [s for s in required_stats if s not in data]
                self.log(f"❌ Stats missing fields: {missing}")
        return success

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 BLOGS 4 BLOCKS - BACKEND API TESTING")
    print("=" * 60)
    
    tester = BlogsAPITester()
    
    # Run all tests
    tests = [
        tester.test_categories_endpoint,
        tester.test_posts_endpoint, 
        tester.test_post_detail,
        tester.test_user_registration,
        tester.test_user_login,
        tester.test_create_post,
        tester.test_like_post,
        tester.test_create_comment,
        tester.test_get_comments,
        tester.test_guest_post_creation,
        tester.test_stats_endpoint
    ]
    
    print(f"\n📋 Running {len(tests)} API tests...\n")
    
    for test in tests:
        try:
            test()
        except Exception as e:
            tester.log(f"❌ EXCEPTION in {test.__name__}: {str(e)}")
        print()  # Add spacing between tests
    
    # Final results
    print("=" * 60)
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📊 TEST RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print("🎉 BACKEND APIs are working well!")
        return 0
    elif success_rate >= 50:
        print("⚠️  BACKEND has some issues but core functionality works")
        return 1
    else:
        print("🚨 BACKEND has major issues - needs fixing")
        return 2

if __name__ == "__main__":
    sys.exit(main())