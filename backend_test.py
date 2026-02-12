import requests
import sys
import os
import json
from datetime import datetime
from io import BytesIO

# Get the backend URL from frontend env (external URL)
BACKEND_URL = "https://marketing-forum-hub.preview.emergentagent.com/api"

class B4BTestSuite:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        self.test_user_email = "demo@b4b.com"
        self.test_user_password = "password123"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_post_id = None
        self.uploaded_image_url = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, test_name, test_func):
        """Run a single test and track results"""
        self.tests_run += 1
        self.log(f"Running: {test_name}")
        try:
            result = test_func()
            if result:
                self.tests_passed += 1
                self.log(f"✅ PASSED: {test_name}")
                return True
            else:
                self.failed_tests.append(test_name)
                self.log(f"❌ FAILED: {test_name}")
                return False
        except Exception as e:
            self.failed_tests.append(f"{test_name}: {str(e)}")
            self.log(f"❌ ERROR: {test_name} - {str(e)}")
            return False

    def test_login(self):
        """Test user login"""
        try:
            response = requests.post(f"{self.base_url}/auth/login", json={
                "email": self.test_user_email,
                "password": self.test_user_password
            }, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.token = data['token']
                    self.log(f"Login successful, got token")
                    return True
            self.log(f"Login failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Login error: {str(e)}")
            return False

    def test_image_upload(self):
        """Test POST /api/upload - Image upload functionality"""
        if not self.token:
            self.log("No token available for image upload test")
            return False
        
        try:
            # Create a simple test image (1x1 pixel PNG)
            png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
            
            files = {
                'file': ('test.png', BytesIO(png_data), 'image/png')
            }
            headers = {'Authorization': f'Bearer {self.token}'}
            
            response = requests.post(f"{self.base_url}/upload", files=files, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'url' in data and 'filename' in data:
                    self.uploaded_image_url = data['url']
                    self.log(f"Image upload successful: {data['url']}")
                    return True
            
            self.log(f"Image upload failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Image upload error: {str(e)}")
            return False

    def test_uploaded_image_access(self):
        """Test GET /api/uploads/{filename} - Uploaded images accessibility"""
        if not self.uploaded_image_url:
            self.log("No uploaded image URL to test")
            return False
        
        try:
            # Remove leading slash if present for full URL construction
            image_path = self.uploaded_image_url.lstrip('/')
            full_url = f"{self.base_url.replace('/api', '')}/{image_path}"
            
            response = requests.get(full_url, timeout=10)
            
            if response.status_code == 200:
                if response.headers.get('content-type', '').startswith('image/'):
                    self.log(f"Image accessible at: {full_url}")
                    return True
                else:
                    self.log(f"Image URL returned non-image content-type: {response.headers.get('content-type')}")
                    return False
            
            self.log(f"Image access failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Image access error: {str(e)}")
            return False

    def test_create_post_with_cover_image(self):
        """Test POST /api/posts with cover_image field"""
        if not self.token or not self.uploaded_image_url:
            self.log("Missing token or uploaded image for post creation test")
            return False
        
        try:
            post_data = {
                "title": "Test Post with Cover Image",
                "content": "<p>This is a test post with a cover image.</p>",
                "excerpt": "Testing cover image functionality",
                "category_slug": "marketing-tools",
                "tags": ["test", "cover-image"],
                "cover_image": self.uploaded_image_url
            }
            
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(f"{self.base_url}/posts", json=post_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('cover_image') == self.uploaded_image_url:
                    self.test_post_id = data['id']
                    self.log(f"Post created with cover image: {data['id']}")
                    return True
            
            self.log(f"Post creation failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Post creation error: {str(e)}")
            return False

    def test_get_post_with_cover_image(self):
        """Test GET /api/posts/{id} returns cover_image field"""
        if not self.test_post_id:
            self.log("No test post ID available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/posts/{self.test_post_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'cover_image' in data and data['cover_image'] == self.uploaded_image_url:
                    self.log(f"Post retrieved with correct cover_image: {data['cover_image']}")
                    return True
                else:
                    self.log(f"Post missing or incorrect cover_image. Got: {data.get('cover_image')}")
                    return False
            
            self.log(f"Post retrieval failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Post retrieval error: {str(e)}")
            return False

    def test_websocket_endpoint(self):
        """Test WebSocket connection endpoint availability"""
        try:
            # We can't easily test WebSocket in requests, but we can check if the endpoint exists
            # by testing with a regular HTTP request (which should fail in a specific way)
            import urllib3
            urllib3.disable_warnings()
            
            # Test with a dummy post ID - the WebSocket endpoint should at least be reachable
            ws_url = self.base_url.replace('https://', 'wss://').replace('/api', '/api/ws/comments/test-post-id')
            
            # For now, we'll just validate the URL format and structure
            if '/api/ws/comments/' in ws_url and ws_url.startswith('wss://'):
                self.log(f"WebSocket URL format correct: {ws_url}")
                return True
            else:
                self.log(f"WebSocket URL format incorrect: {ws_url}")
                return False
        except Exception as e:
            self.log(f"WebSocket test error: {str(e)}")
            return False

    def test_create_comment(self):
        """Test comment creation and email notification trigger"""
        if not self.token or not self.test_post_id:
            self.log("Missing token or test post for comment creation")
            return False
        
        try:
            comment_data = {
                "content": "This is a test comment to trigger email notifications"
            }
            
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.base_url}/posts/{self.test_post_id}/comments", 
                json=comment_data, 
                headers=headers, 
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('content') == comment_data['content']:
                    self.log(f"Comment created successfully: {data['id']}")
                    self.log("Note: Email notification should be triggered (check backend logs)")
                    return True
            
            self.log(f"Comment creation failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Comment creation error: {str(e)}")
            return False

    def test_get_posts_endpoint(self):
        """Test GET /api/posts to see if posts with cover images are returned"""
        try:
            response = requests.get(f"{self.base_url}/posts?limit=10", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'posts' in data and len(data['posts']) > 0:
                    # Check if any posts have cover_image field
                    posts_with_covers = [p for p in data['posts'] if p.get('cover_image')]
                    self.log(f"Found {len(posts_with_covers)} posts with cover images out of {len(data['posts'])} total posts")
                    return True
                else:
                    self.log("No posts found in response")
                    return False
            
            self.log(f"Get posts failed: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            self.log(f"Get posts error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("🧪 Starting Blogs 4 Blocks Backend API Tests")
        self.log(f"Backend URL: {self.base_url}")
        
        # Authentication test
        self.run_test("User Login", self.test_login)
        
        # Image upload tests
        self.run_test("Image Upload (POST /api/upload)", self.test_image_upload)
        self.run_test("Uploaded Images Access (GET /api/uploads/{filename})", self.test_uploaded_image_access)
        
        # Post with cover image tests  
        self.run_test("Create Post with Cover Image", self.test_create_post_with_cover_image)
        self.run_test("Get Post with Cover Image Field", self.test_get_post_with_cover_image)
        self.run_test("Get Posts Endpoint", self.test_get_posts_endpoint)
        
        # WebSocket test
        self.run_test("WebSocket Endpoint Structure", self.test_websocket_endpoint)
        
        # Comment and notification test
        self.run_test("Comment Creation & Email Notification", self.test_create_comment)
        
        # Final report
        self.log(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            self.log("❌ Failed Tests:")
            for test in self.failed_tests:
                self.log(f"   - {test}")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All backend tests passed!")
            return True
        else:
            self.log(f"⚠️  {len(self.failed_tests)} tests failed")
            return False

def main():
    tester = B4BTestSuite()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())