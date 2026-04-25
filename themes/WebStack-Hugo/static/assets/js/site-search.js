(function ($) {
    var $root;
    var $panel;
    var $toggle;
    var $input;
    var $results;
    var $count;
    var sites = [];
    var currentResults = [];
    var activeIndex = 0;
    var activeTimer = null;

    function normalize(value) {
        return (value || '').toString().replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function escapeHtml(value) {
        return (value || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function sectionName($card) {
        var $row = $card.closest('.row');
        var name = $row.prevAll('.d-flex').first().find('h4').text();
        return $.trim(name.replace(/\s+/g, ' '));
    }

    function buildIndex() {
        sites = [];
        $('.content-site .url-card').each(function (index) {
            var $card = $(this);
            var $link = $card.find('a.card').first();
            var title = $.trim($card.find('.url-info strong').first().text());
            var description = $.trim($card.find('.url-info p').first().text());
            var url = $link.attr('data-url') || $link.attr('href') || '';
            var category = sectionName($card);

            if (!title || !url || url === 'javascript:') {
                return;
            }

            sites.push({
                id: index,
                title: title,
                description: description,
                url: url,
                category: category,
                text: normalize([title, description, url, category].join(' ')),
                titleText: normalize(title),
                urlText: normalize(url),
                $card: $card
            });
        });
    }

    function scoreSite(site, words, query) {
        var score = 0;

        if (site.titleText === query) {
            score += 120;
        } else if (site.titleText.indexOf(query) === 0) {
            score += 90;
        } else if (site.titleText.indexOf(query) > -1) {
            score += 70;
        }

        if (site.urlText.indexOf(query) > -1) {
            score += 35;
        }

        for (var i = 0; i < words.length; i++) {
            if (site.text.indexOf(words[i]) === -1) {
                return 0;
            }
            score += 10;
            if (site.titleText.indexOf(words[i]) > -1) {
                score += 20;
            }
        }

        return score;
    }

    function findSites(query) {
        var clean = normalize(query);
        var words = clean.split(' ').filter(Boolean);
        var matched = [];

        if (!clean) {
            return [];
        }

        for (var i = 0; i < sites.length; i++) {
            var score = scoreSite(sites[i], words, clean);
            if (score > 0) {
                matched.push($.extend({ score: score }, sites[i]));
            }
        }

        matched.sort(function (a, b) {
            return b.score - a.score || a.title.localeCompare(b.title, 'zh-Hans-CN');
        });

        return matched.slice(0, 12);
    }

    function render(query) {
        currentResults = findSites(query);
        activeIndex = 0;
        $results.empty();
        $count.text(currentResults.length + ' 个结果');

        if (!normalize(query)) {
            $count.text(sites.length + ' 个网站');
            return;
        }

        if (!currentResults.length) {
            $results.append('<div class="site-search-empty">没有匹配的网站</div>');
            return;
        }

        for (var i = 0; i < currentResults.length; i++) {
            var site = currentResults[i];
            var item = [
                '<button class="site-search-result',
                i === 0 ? ' is-active' : '',
                '" type="button" data-site-index="',
                i,
                '">',
                '<span class="site-search-result-title">',
                escapeHtml(site.title),
                '</span>',
                '<span class="site-search-result-desc">',
                escapeHtml(site.category || site.description),
                '</span>',
                '</button>'
            ].join('');

            $results.append(item);
        }
    }

    function setActive(index) {
        var max = currentResults.length - 1;
        if (max < 0) {
            return;
        }

        activeIndex = Math.max(0, Math.min(index, max));
        $results.find('.site-search-result').removeClass('is-active')
            .eq(activeIndex).addClass('is-active')[0].scrollIntoView({
                block: 'nearest'
            });
    }

    function openPanel() {
        $root.addClass('is-open');
        $toggle.attr('aria-expanded', 'true');
        setTimeout(function () {
            $input.trigger('focus').select();
        }, 80);
    }

    function closePanel() {
        $root.removeClass('is-open');
        $toggle.attr('aria-expanded', 'false');
    }

    function jumpTo(site) {
        if (!site || !site.$card || !site.$card.length) {
            return;
        }

        $('.url-card .url-body').removeClass('site-search-target');
        site.$card.find('.url-body').first().addClass('site-search-target');

        $('html, body').stop(true).animate({
            scrollTop: Math.max(0, site.$card.offset().top - 110)
        }, 420, 'swing');

        if (activeTimer) {
            clearTimeout(activeTimer);
        }

        activeTimer = setTimeout(function () {
            site.$card.find('.url-body').first().removeClass('site-search-target');
        }, 4200);
    }

    $(function () {
        $root = $('#site-search-float');
        if (!$root.length) {
            return;
        }

        $panel = $root.find('.site-search-panel');
        $toggle = $root.find('.site-search-toggle');
        $input = $('#site-search-input');
        $results = $('#site-search-results');
        $count = $root.find('.site-search-count');

        buildIndex();
        render('');

        $toggle.on('click', function () {
            if ($root.hasClass('is-open')) {
                closePanel();
            } else {
                openPanel();
            }
        });

        $input.on('input', function () {
            render(this.value);
        });

        $root.find('.site-search-form').on('submit', function (event) {
            event.preventDefault();
            if (currentResults.length) {
                jumpTo(currentResults[activeIndex]);
            }
        });

        $root.find('.site-search-clear').on('click', function () {
            $input.val('');
            render('');
            $input.trigger('focus');
        });

        $results.on('click', '.site-search-result', function () {
            var index = parseInt($(this).attr('data-site-index'), 10);
            setActive(index);
            jumpTo(currentResults[index]);
        });

        $input.on('keydown', function (event) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive(activeIndex + 1);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive(activeIndex - 1);
            } else if (event.key === 'Escape') {
                closePanel();
            }
        });

        $(document).on('click', function (event) {
            if (!$root[0].contains(event.target)) {
                closePanel();
            }
        });
    });
})(jQuery);
