import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.white,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  runApp(const KryrosMobileApp());
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("Handling a background message: ${message.messageId}");
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
    _setupNotifications();
  }

  Future<void> _setupNotifications() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    // Request permissions
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get token
      String? token = await messaging.getToken();
      if (token != null) {
        debugPrint("FCM Token: $token");
        _sendTokenToWebView(token);
      }
    }

    // Handle notification clicks when app is in background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (message.data.containsKey('url')) {
        String url = message.data['url'];
        if (!url.startsWith('http')) {
          url = primaryUrl + (url.startsWith('/') ? url.substring(1) : url);
        }
        controller.loadRequest(Uri.parse(url));
      }
    });

    // Handle notification clicks when app is in foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // For now, we'll just show a snackbar if the app is open
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message.notification?.body ?? "New notification received"),
            action: SnackBarAction(
              label: "VIEW",
              onPressed: () {
                if (message.data.containsKey('url')) {
                  controller.loadRequest(Uri.parse(message.data['url']));
                }
              },
            ),
          ),
        );
      }
    });
  }

  void _sendTokenToWebView(String token) {
    // We'll try to inject this multiple times to ensure the page is loaded
    Future.delayed(const Duration(seconds: 2), () {
      controller.runJavaScript('if(window.setFCMToken) { window.setFCMToken("$token"); } else { localStorage.setItem("fcm_token", "$token"); }');
    });
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
              Container(
                color: Colors.white,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1FA89A).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.wifi_off_rounded,
                            size: 60,
                            color: Color(0xFF1FA89A),
                          ),
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'CONNECTION FAILED',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1B2533),
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'We couldn\'t reach our servers. Please check your internet connection and try again.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 15,
                            height: 1.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 48),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _retryWithFallback,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1FA89A),
                              foregroundColor: Colors.white,
                              elevation: 8,
                              shadowColor: const Color(0xFF1FA89A).withOpacity(0.4),
                              padding: const EdgeInsets.symmetric(vertical: 20),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            child: const Text(
                              'RETRY CONNECTION',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        TextButton(
                          onPressed: () {
                            // Reset to primary URL and try again
                            _initWebViewController(primaryUrl);
                          },
                          child: const Text(
                            'REFRESH PAGE',
                            style: TextStyle(
                              color: Color(0xFF64748B),
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}