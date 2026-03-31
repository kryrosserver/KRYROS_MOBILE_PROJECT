import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(const KryrosMobileApp());
}

class KryrosMobileApp extends StatelessWidget {
  const KryrosMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kryros Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController controller;
  bool isLoading = true;
  String currentUrl = 'https://kryros.com/';
  bool hasError = false;
  
  // URLs for fallback - primary and backup
  static const String primaryUrl = 'https://kryros.com/';
  static const String backupUrl = 'https://kryrosweb-dr6p.onrender.com/';

  @override
  void initState() {
    super.initState();
    _initWebViewController(primaryUrl);
  }

  Future<void> _initWebViewController(String url) async {
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              isLoading = true;
              hasError = false;
              currentUrl = url;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
              currentUrl = url;
            });
          },
          onWebResourceError: (WebResourceError error) {
            _handleError();
          },
          onNavigationRequest: (NavigationRequest request) {
            // Allow all navigation requests
            return NavigationDecision.navigate;
          },
        ),
      );

    await controller.loadRequest(Uri.parse(url));
  }

  Future<void> _handleError() async {
    if (!hasError && currentUrl == primaryUrl) {
      // Try the backup URL if primary fails
      setState(() {
        hasError = true;
        isLoading = true;
      });
      await _initWebViewController(backupUrl);
    } else {
      setState(() {
        isLoading = false;
        hasError = true;
      });
    }
  }

  Future<void> _retryWithFallback() async {
    setState(() {
      isLoading = true;
      hasError = false;
    });
    
    // Try backup URL first if primary failed
    if (currentUrl == primaryUrl) {
      await _initWebViewController(backupUrl);
    } else {
      // Try primary URL
      await _initWebViewController(primaryUrl);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // WebView
          WebViewWidget(controller: controller),
          
          // Loading indicator
          if (isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: Colors.deepPurple,
              ),
            ),
          
          // Error view with retry button
          if (hasError && !isLoading)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Unable to load the app',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please check your internet connection',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _retryWithFallback,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Try Again'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
      
      // Bottom navigation bar for URL switching
      bottomNavigationBar: BottomAppBar(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            // Refresh button
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () {
                controller.reload();
              },
              tooltip: 'Refresh',
            ),
            
            // Current URL indicator
            Expanded(
              child: Text(
                currentUrl == primaryUrl ? 'kryros.com' : 'render.com',
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12),
              ),
            ),
            
            // Switch URL button (manual fallback)
            IconButton(
              icon: const Icon(Icons.swap_horiz),
              onPressed: () async {
                if (currentUrl == primaryUrl) {
                  await _initWebViewController(backupUrl);
                } else {
                  await _initWebViewController(primaryUrl);
                }
              },
              tooltip: 'Switch URL',
            ),
          ],
        ),
      ),
    );
  }
}