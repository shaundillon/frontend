define([
    'lib/$',
    'bean',
    'bonzo',
    'fastdom',
    'lib/config',
    'lodash/utilities/template',
    'lib/robust',
    'common/modules/email/run-checks',
    'lib/page',
    'lib/storage',
    'common/modules/check-mediator',
    'raw-loader!common/views/experiments/email-demand-test.html'
], function (
    $,
    bean,
    bonzo,
    fastdom,
    config,
    template,
    robust,
    emailRunChecks,
    page,
    storage,
    checkMediator,
    emailDemandTemplate
) {
    return function () {
        this.id = 'EmailDemandTests';
        this.start = '2017-03-27';
        this.expiry = '2017-04-21';
        this.author = 'Leigh-Anne Mathieson';
        this.description = 'Show an email sign up that simply tracks clicks and links to a google form for food, business, and cities articles.';
        this.audience = 1;
        this.audienceOffset = 0; //just needs to not clash with recommended for you, which is offset 0.2
        this.successMeasure = 'Number of clicks';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will demonstrate their interest in food, business and/or cities emails';

        var sectionBelowEmailSignup = '.content-footer';

        var listConfigs = {
            food: {
                listName: 'food',
                displayName: {
                    normalText: 'food',
                    accentedText: 'weekly'
                },
                headline: "What's for dinner?",
                description: "Sign-up for our new weekly food email and you’ll get recipes, restaurant reviews the best" +
                " of all things culinary. Whether you’re a full-on foodie or a budding gastronaut, we’ve something to sate your appetite",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLSeGAacgwIRrUFxKPRSUG-imlqEwUKgVYFhOnJP4__avevZEHw/viewform?usp=sf_link",
                canRun: function () {
                    var tags = config.page.keywordIds.concat(config.page.nonKeywordTagIds);

                    return tags.includes('lifeandstyle/food-and-drink') || tags.includes('tone/recipes');
                }
            },
            cities: {
                listName: 'cities',
                displayName: {
                    normalText: 'cities'
                },
                headline: "Want more stories from Guardian Cities?",
                description: "Sign up for our new email and get  in-depth journalism exploring cities and urban life all " +
                "over the world – from gentrification and climate change to cycling and urban history",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLScUfA4BZ8RtDGJaM9NSVc7YxDRg_SB9-bLtdJG-Gml837cayQ/viewform?usp=sf_link",
                canRun: function () {
                    return config.page.section === 'cities';
                }
            },
            business: {
                listName: 'business',
                displayName: {
                    normalText: 'business',
                    accentedText: 'today'
                },
                headline: "Business updates, direct to your inbox",
                description: "Sign up to our daily email for an at-a-glance guide to the biggest stories, smartest " +
                "analysis and hottest topics in the world of business and economics",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLSclNwg8nkuwYrApRnnVkhGsdIIb85Uk0_DTEoCRiMDdgqIBFQ/viewform?usp=sf_link",
                canRun: function () {
                    return config.page.section === 'business';
                }
            }
        };

        this.canRun = function () {
            checkMediator.waitForCheck('emailCanRun').then(function (emailCanRun) {
                    return emailCanRun && (whichTestToRun());
            }).catch(function (error) {
                robust.log('check-mediator', error);
            });
        };

        this.variants = [
            {
                id: 'show-demand-tests',
                success: insertEmailDemandSection()
            }
        ];

        function whichTestToRun() {
            if(listConfigs.food.canRun()) return listConfigs.food.listName;
            else if(listConfigs.business.canRun()) return listConfigs.business.listName;
            else if (listConfigs.cities.canRun()) return listConfigs.cities.listName;

            else return null;
        }

        function insertEmailDemandSection() {
            var name = whichTestToRun();
            var listConfig = listConfigs[name];

            var $demandTestSection = $.create(template(emailDemandTemplate, {
                listName: listConfig.listName,
                headline: listConfig.headline,
                description: listConfig.description,
                normalText: listConfig.displayName.normalText,
                accentedText: listConfig.displayName.accentedText,
                linkOnClick: listConfig.linkOnClick
            }));

            fastdom.write(function () {
                $demandTestSection.insertBefore(sectionBelowEmailSignup);
                emailRunChecks.setEmailShown(listConfig.listName);
                storage.session.set('email-sign-up-seen', 'true');

                //TODO: can I move this to the template???
                var link = '<a href="' + listConfig.linkOnClick + '" class="email-sub__submit-button--solo js-email-demand-link js-email-sub__submit-button button button--tertiary button--large button--tone-news" > Sign up </a>'; //email-sub__submit-button
                $('.js-button-email-demand').append(link);
            });

        }

    }

});
