import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private let themeBackgroundColor = UIColor(red: 3/255, green: 0/255, blue: 16/255, alpha: 1.0)

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set window background to match app theme — prevents white flashes
        window?.backgroundColor = themeBackgroundColor
        window?.tintColor = UIColor(red: 208/255, green: 114/255, blue: 255/255, alpha: 1.0)

        // Configure WKWebView after a short delay to ensure it's loaded
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.configureWebView()
        }

        return true
    }

    /// Configure WKWebView for native-like performance
    private func configureWebView() {
        guard let rootVC = window?.rootViewController else { return }
        rootVC.view.backgroundColor = themeBackgroundColor

        // Find the WKWebView in the view hierarchy
        if let webView = findWebView(in: rootVC.view) {
            // Match background color to app theme — eliminates white flash on transitions
            webView.backgroundColor = themeBackgroundColor
            webView.isOpaque = true
            if #available(iOS 15.0, *) {
                webView.underPageBackgroundColor = themeBackgroundColor
            }

            // Enable edge swipe back gesture for native iOS navigation feel
            webView.allowsBackForwardNavigationGestures = true

            // Scroll view optimizations
            webView.scrollView.backgroundColor = themeBackgroundColor
            webView.scrollView.showsHorizontalScrollIndicator = false
            webView.scrollView.showsVerticalScrollIndicator = false
            // Prevent bouncing on the root scroll view (app handles its own scroll)
            webView.scrollView.bounces = false
            webView.scrollView.alwaysBounceVertical = false
            // Faster touch response — eliminates 300ms tap delay
            webView.scrollView.delaysContentTouches = false
            webView.scrollView.isDirectionalLockEnabled = true
            webView.scrollView.decelerationRate = .normal
            // Match native chat apps: drag the keyboard down from the scroll view.
            webView.scrollView.keyboardDismissMode = .interactive
            // Content inset adjustment
            webView.scrollView.contentInsetAdjustmentBehavior = .never
            if #available(iOS 13.0, *) {
                webView.scrollView.automaticallyAdjustsScrollIndicatorInsets = false
            }
        }
    }

    /// Recursively find WKWebView in view hierarchy
    private func findWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }
        for subview in view.subviews {
            if let webView = findWebView(in: subview) {
                return webView
            }
        }
        return nil
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Re-configure WebView when returning to foreground (ensures settings persist)
        configureWebView()
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
