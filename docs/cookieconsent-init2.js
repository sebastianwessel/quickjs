// obtain cookieconsent plugin
window.onload = () => {
	window.cc = initCookieConsent()

	// run plugin with config object
	window.cc.run({
		current_lang: 'en',
		autoclear_cookies: true, // default: false
		cookie_name: 'cc_cookie', // default: 'cc_cookie'
		cookie_expiration: 365, // default: 182
		page_scripts: true, // default: false
		force_consent: true, // default: false
		autorun: true,

		// auto_language: null,                     // default: null; could also be 'browser' or 'document'
		// autorun: true,                           // default: true
		// delay: 0,                                // default: 0
		// hide_from_bots: false,                   // default: false
		// remove_cookie_tables: false              // default: false
		// cookie_domain: location.hostname,        // default: current domain
		// cookie_path: '/',                        // default: root
		// cookie_same_site: 'Lax',
		// use_rfc_cookie: false,                   // default: false
		// revision: 0,                             // default: 0

		gui_options: {
			consent_modal: {
				layout: 'cloud', // box,cloud,bar
				position: 'middle center', // bottom,middle,top + left,right,center
				transition: 'slide', // zoom,slide
			},
			settings_modal: {
				layout: 'bar', // box,bar
				position: 'left', // right,left (available only if bar layout selected)
				transition: 'slide', // zoom,slide
			},
		},

		onFirstAction: () => {
			if (window.cc.allowedCategory('necessary')) {
				loadNecessary()
			}
			if (window.cc.allowedCategory('analytics')) {
				loadGoogleAnalytics()
			}
		},

		onAccept: cookie => {
			if (window.cc.allowedCategory('necessary')) {
				loadNecessary()
			}
			if (window.cc.allowedCategory('analytics')) {
				loadGoogleAnalytics()
			}
		},

		onChange: (cookie, changed_preferences) => {
			// If analytics category is disabled => disable google analytics
			if (!window.cc.allowedCategory('analytics')) {
				typeof gtag === 'function' &&
					gtag('consent', 'update', {
						analytics_storage: 'denied',
					})
			}
		},

		languages: {
			en: {
				consent_modal: {
					title: 'Please help us, and accept the usage of cookies!<br/>You will get one for free 😉',
					description:
						'Our website uses essential cookies and external services to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="/privacy.html" class="cc-link">Privacy policy</a>',
					primary_btn: {
						text: 'Accept all',
						role: 'accept_all', // 'accept_selected' or 'accept_all'
					},
					secondary_btn: {
						text: 'Preferences',
						role: 'settings', // 'settings' or 'accept_necessary'
					},
					revision_message: '<br><br> Dear user, terms and conditions have changed since the last time you visited!',
				},
				settings_modal: {
					title: 'Cookie & service settings',
					save_settings_btn: 'Save current selection',
					accept_all_btn: 'Accept all',
					reject_all_btn: 'Reject all',
					close_btn_label: 'Close',
					cookie_table_headers: [{ col1: 'Name' }, { col2: 'Provider' }, { col3: 'Purpose' }],
					blocks: [
						{
							title: 'Cookie usage',
							description:
								`We use cookies in a moderate way to provide the visitor with the best possible experience.
Furthermore, we would like to know how many visitors we have on our website.` +
								' <a href="/privacy.html" class="cc-link">Privacy Policy</a>.',
						},
						{
							title: 'Strictly necessary cookies',
							description: ``,
							toggle: {
								value: 'necessary',
								enabled: true,
								readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
							},
							cookie_table: [
								{
									col1: 'cc_cookie',
									col2: 'Our website',
									col3: 'Remember your settings',
								},
							],
						},
						/*
            {
              title: 'Analytics & Performance cookies',
              description: `We would like to know how successful our website is.<br/>
              Therefore, we use Google Analytics to find out, for example, the number of monthly visitors to our website.`,
              toggle: {
                value: 'analytics',
                enabled: true,
                readonly: false,
              },
              cookie_table: [
                {
                  col1: '^_ga',
                  col2: 'Google Analytics',
                  col3: 'Insight about our website',
                  is_regex: true,
                },
                {
                  col1: '^_gid',
                  col2: 'Google Analytics',
                  col3: 'Insight about our website',
                  is_regex: true,
                },
              ],
            },
            */
						/*
          {
            title: 'More information',
            description: LOREM_IPSUM + ' <a class="cc-link" href="https://orestbida.com/contact/">Contact me</a>.',
          }, */
					],
				},
			},
		},
	})
}

function loadGoogleAnalytics() {
	/*
  const g = document.createElement('script')
  g.onload = function () {
    window.dataLayer = window.dataLayer || []
    function gtag() {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())

    gtag('config', 'G-02L3K7YXXK')
  }
  g.src = 'https://www.googletagmanager.com/gtag/js?id=G-02L3K7YXXK'

  document.head.appendChild(g)
  */
}

function loadNecessary() {}
