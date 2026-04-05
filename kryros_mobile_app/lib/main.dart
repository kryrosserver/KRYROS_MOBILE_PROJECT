import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.white,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
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
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1FA89A)),
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

class _WebViewScreenState extends State<WebViewScreen> with SingleTickerProviderStateMixin {
  late final WebViewController controller;
  bool isLoading = true;
  String currentUrl = 'https://kryros.com/';
  bool hasError = false;
  late AnimationController _animationController;
  late Animation<double> _animation;
  
  // URLs for fallback - primary and backup
  static const String primaryUrl = 'https://kryros.com/';
  static const String backupUrl = 'https://kryrosweb-dr6p.onrender.com/';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.8, end: 1.1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _initWebViewController(primaryUrl);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _initWebViewController(String url) async {
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFFFFFF))
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
            // Give the animation a bit more time for a smooth transition
            Future.delayed(const Duration(milliseconds: 500), () {
              if (mounted) {
                setState(() {
                  isLoading = false;
                  currentUrl = url;
                });
              }
            });
          },
          onWebResourceError: (WebResourceError error) {
            _handleError();
          },
          onNavigationRequest: (NavigationRequest request) async {
            final String url = request.url;
            
            // Handle WhatsApp, Phone, Email, and other external links
            if (url.startsWith('whatsapp:') || 
                url.startsWith('https://wa.me/') ||
                url.startsWith('tel:') || 
                url.startsWith('mailto:') ||
                url.contains('maps.google.com') ||
                url.contains('facebook.com')) {
              
              try {
                final Uri uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                  return NavigationDecision.prevent;
                }
              } catch (e) {
                debugPrint('Error launching external URL: $e');
              }
            }
            
            return NavigationDecision.navigate;
          },
        ),
      );

    await controller.loadRequest(Uri.parse(url));
  }

  Future<void> _handleError() async {
    if (!hasError && currentUrl == primaryUrl) {
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
    
    if (currentUrl == primaryUrl) {
      await _initWebViewController(backupUrl);
    } else {
      await _initWebViewController(primaryUrl);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // WebView
            WebViewWidget(controller: controller),
            
            // Animated Splash Screen / Loading Indicator
            if (isLoading)
              Container(
                color: Colors.white,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ScaleTransition(
                        scale: _animation,
                        child: SvgPicture.asset(
                          'assets/images/logo.svg',
                          width: 150,
                          height: 150,
                          // Fallback to Icon if SVG not found
                          placeholderBuilder: (BuildContext context) => const Icon(
                            Icons.shopping_cart,
                            size: 100,
                            color: Color(0xFF1FA89A),
                          ),
                        ),
                      ),
                      const SizedBox(height: 48),
                      const SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          color: Color(0xFF1FA89A),
                          strokeWidth: 3,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            
            // Error view with retry button
            if (hasError && !isLoading)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 80,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'UNABLE TO LOAD KRYROS',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Please check your internet connection and try again.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 40),
                      ElevatedButton(
                        onPressed: _retryWithFallback,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF6B00),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 48,
                            vertical: 18,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          'RETRY CONNECTION',
                          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}