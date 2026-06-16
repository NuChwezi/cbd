$(document).ready(function(e) {
    $(".stepsForm").stepsForm({
        theme: 'default'
    });
    $(".container .themes>span").click(function(e) {
        $(".container .themes>span").removeClass("selectedx");
        $(this).addClass("selectedx");
        $(".stepsForm, .theme").removeClass().addClass("stepsForm");
        $(".stepsForm, .theme").addClass("sf-theme-" + $(this).attr("data-value"));
    });
    function activateStep(step) {
        $('.step').removeClass('sf-active');
        $('.step').css({
            'display': 'none'
        });
        $('.step-' + step).addClass('sf-active');
        $('.step-' + step).css({
            'display': 'block'
        });
    }
    /**
         * Returns a random number between min (inclusive) and max (exclusive)
         */
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    /**
         * Returns a list of count random numbers between min (inclusive) and max (exclusive)
         */
    function getRandomArbitraryList(count, min, max) {
        var list = [];
        for (var i = 0; i < count; i++)
            list.push(Math.floor(Math.random() * (max - min) + min));
        return list;
    }
    var lock = false;
    /* get list of random numbers from the Random.org service */
    function getRandomDigits(count, min, max, callback, override) {
        lock = true;
        $.ajax({
            url: 'https://www.random.org/integers/?num=' + count + '&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new&__time=' + (new Date()).getTime(),
            method: 'GET'
        }).done(function(data) {
            if (data == undefined) {
                callback(getRandomArbitraryList(count, min, max + 1).map(function(n, i) {
                    return override == undefined ? Number(n) : override[i] || Number(n);
                }));
            } else {
                callback(data.split("\n").map(function(n, i) {
                    return override == undefined ? Number(n) : override[i] || Number(n);
                }));
            }
            lock = false;
        }).fail(function() {
            callback(getRandomArbitraryList(count, min, max + 1).map(function(n, i) {
                return override == undefined ? Number(n) : override[i] || Number(n);
            }));
            lock = false;
        });
    }
    /* get a single random number from the Random.org service */
    function getRandomDigit(min, max, callback, override) {
        lock = true;
        if (override != null ) {
            callback(Number(override));
            lock = false;
            return;
        }
        $.ajax({
            url: 'https://www.random.org/integers/?num=1&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new&__time=' + (new Date()).getTime(),
            method: 'GET'
        }).done(function(data) {
            callback(data == undefined ? getRandomArbitrary(min, max + 1) : Number(data));
            lock = false;
        }).fail(function() {
            callback(getRandomArbitrary(min, max + 1));
            lock = false;
        });
    }
    var activeStep = 0;
    var words = [];
    var wordIndex = null ;
    var cbd = {}
    var currentPage = 0;
    var paramList = null ;
    $('.cbd-action').click(function() {
        if (lock)
            return;
        var step = Number($(this).data('step'));
        switch (step) {
            // get question
        case 0:
            {
                var q = $('#cbd-q').val();
                if (q.length > 0) {
                    var exp = $('#cbd-expression').text();
                    exp += "|Q| " + q + " |A| ";
                    $('#cbd-expression').text(exp);
                    cbd['q'] = q;
                    // store it
                    activeStep += 1;
                    activateStep(activeStep);
                } else {
                    $('#cbd-q').focus();
                }
                break;
            }
            // get the book stack, based off number of stacks
        case 1:
            {
                var w = $('#cbd-w').val();
                if (w.length > 0) {
                    w = Number(w);
                    getRandomDigit(1, 99, function(num) {
                        var n = num;
                        var exp = $('#cbd-expression').text();
                        exp += "{:" + n + "(mod " + w + "), ";
                        $('#cbd-expression').text(exp);
                        cbd['bsi'] = (n % w == 0) ? w : n % w;
                        cbd['bsi_n'] = n;
                        cbd['bsi_w'] = w;
                        activeStep += 1;
                        activateStep(activeStep);
                    });
                } else {
                    $('#cbd-w').focus();
                }
                break;
            }
            // get direction to chosen book stack
        case 2:
            {
                getRandomDigit(0, 99, function(num) {
                    var n = num;
                    var exp = $('#cbd-expression').text();
                    exp += "{!" + n + ", ";
                    $('#cbd-expression').text(exp);
                    cbd['d-bsi'] = n;
                    activeStep += 1;
                    activateStep(activeStep);
                    var instruction = "Refer to the " + cbd['bsi'].ordinate() + " book stack, counting " + ((n % 2 == 0) ? "left to right" : "right to left");
                    $('.cbd-instruction-' + activeStep).text(instruction);
                });
                break;
            }
            // get index of chosen book in the stack
        case 3:
            {
                var x = $('#cbd-x').val();
                if (x.length > 0) {
                    x = Number(x);
                    getRandomDigit(10, 99, function(num) {
                        var n = num;
                        var exp = $('#cbd-expression').text();
                        exp += "}:" + n + "(mod " + x + "), ";
                        $('#cbd-expression').text(exp);
                        cbd['bi'] = (n % x == 0) ? x : n % x;
                        cbd['bi_n'] = n;
                        cbd['bi_x'] = x;
                        activeStep += 1;
                        activateStep(activeStep);
                    });
                } else {
                    $('#cbd-w').focus();
                }
                break;
            }
            // get direction to chosen book in the stack
        case 4:
            {
                getRandomDigit(0, 99, function(num) {
                    var n = num;
                    var exp = $('#cbd-expression').text();
                    exp += "}!:" + n + ", ";
                    $('#cbd-expression').text(exp);
                    cbd['d-bi'] = n;
                    activeStep += 1;
                    activateStep(activeStep);
                    var instruction = "Refer to the " + cbd['bi'].ordinate() + " book in the specified stack, counting " + ((n % 2 == 0) ? "top to bottom" : "bottom to top");
                    $('.cbd-instruction-' + activeStep).text(instruction);
                });
                break;
            }
            // get first page to go to, in the chosen book
        case 5:
            {
                var y = $('#cbd-y').val();
                if (y.length > 0) {
                    y = Number(y);
                    getRandomDigit(1, 99, function(num) {
                        var n = num;
                        var exp = $('#cbd-expression').text();
                        exp += "$:" + n + "(mod " + y + "), ";
                        $('#cbd-expression').text(exp);
                        cbd['fp'] = (n % y == 0) ? y : n % y;
                        cbd['fp_n'] = n;
                        cbd['fp_y'] = y;
                        activeStep += 1;
                        activateStep(activeStep);
                    });
                } else {
                    $('#cbd-w').focus();
                }
                break;
            }
            // get direction to the chosen first page, in the book
        case 6:
            {
                getRandomDigit(0, 99, function(num) {
                    var n = num;
                    var exp = $('#cbd-expression').text();
                    exp += "$!:" + n + ", ";
                    $('#cbd-expression').text(exp);
                    cbd['d-fp'] = n;
                    activeStep += 1;
                    activateStep(activeStep);
                });
                break;
            }
            // get total word count desired in answer (max is forced to 20, where not specified, in this implementation)
        case 7:
            {
                getRandomDigit(1, 20, function(num) {
                    var n = num;
                    cbd['wc'] = n;
                    var exp = $('#cbd-expression').text();
                    var l = $('#cbd-l').val();
                    if (l.length > 0) {
                        l = Number(l);
                        cbd['wc'] = cbd['wc'] % l || l;
                        // use number of words desired by client
                        exp += "#*:" + n + "(mod " + l + "), ";
                    } else
                        exp += "#*:" + n + ", ";
                    // client didn't specify limit, we take given
                    $('#cbd-expression').text(exp);
                    activeStep += 1;
                    activateStep(activeStep);
                });
                break;
            }
            // get initial, vertical direction to the word to be read on the page to be chosen
        case 8:
            {
                getRandomDigit(0, 99, function(num) {
                    var n = num;
                    var exp = $('#cbd-expression').text();
                    exp += "@^!:" + n + ", ";
                    $('#cbd-expression').text(exp);
                    cbd['v-wi'] = n;
                    activeStep += 1;
                    activateStep(activeStep);
                });
                break;
            }
            // get initial, horizontal direction to the word to be read on the page to be chosen
        case 9:
            {
                getRandomDigit(0, 99, function(num) {
                    var n = num;
                    var exp = $('#cbd-expression').text();
                    exp += "@>!:" + n + ", ";
                    $('#cbd-expression').text(exp);
                    cbd['h-wi'] = n;
                    activeStep += 1;
                    activateStep(activeStep);
                    // additionally, get the index of the word to be read (index on the page that is)
                    if (wordIndex == null ) {
                        getRandomDigit(1, 99, function(num) {
                            var n = num;
                            var exp = $('#cbd-expression').text();
                            exp += "@*:";
                            $('#cbd-expression').text(exp);
                            cbd['wi'] = n;
                            wordIndex = n;
                            var _nextPage = (currentPage + cbd['fp']) % cbd['fp_y'] || cbd['fp_y'];
                            // determine what page we should go to next
                            if ((cbd['d-fp'] % 2) != 0) {
                                currentPage = cbd['fp_y'];
                                _nextPage = (currentPage - cbd['fp']) % cbd['fp_y'] || cbd['fp_y'];
                                _nextPage = _nextPage <= 0 ? cbd['fp_y'] + _nextPage : _nextPage;
                                // for proper modulo subtraction
                            }
                            cbd['ps'] = cbd['fp'];
                            // initially, first-page == page skip
                            var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + wordIndex.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                            $('.cbd-instruction-' + activeStep).text(instruction);
                            $('#cbd-word').attr({
                                'placeholder': wordIndex.ordinate() + ' Word'
                            });
                        });
                    }
                });
                break;
            }
            // present next instruction and read next word, or terminate (if we are done), presenting answer...
        case 10:
            {
                var word = $('#cbd-word').val().trim();
                var z = $('#cbd-z').val().trim();
                if (word.length == 0 && z.length == 0)
                    return;
                getRandomDigits(4, 1, 99, function(nums) {
                    cbd['v-wi'] = nums[0];
                    cbd['h-wi'] = nums[1];
                    console.log(JSON.stringify(nums));
                    // update expression...
                    var exp = $('#cbd-expression').text();
                    exp += "@^!:" + cbd['v-wi'] + ", ";
                    $('#cbd-expression').text(exp);
                    // update
                    var exp = $('#cbd-expression').text();
                    exp += "@>!:" + cbd['h-wi'] + ", ";
                    $('#cbd-expression').text(exp);
                    var getNextSkip = false;
                    var _nextPage = null ;
                    cbd['ps'] = nums[2];
                    // new skip
                    var skip = cbd['ps'];
                    _nextPage = (currentPage + skip) % cbd['fp_y'] || cbd['fp_y'];
                    if ((cbd['d-fp'] % 2) != 0) {
                        _nextPage = (currentPage - skip) % cbd['fp_y'] || cbd['fp_y'];
                        ;_nextPage = _nextPage <= 0 ? cbd['fp_y'] + _nextPage : _nextPage;
                        // for proper modulo subtraction
                    }
                    var activeWordIdex = wordIndex;
                    if (word.length > 0) {
                        words.push(word);
                        $('#cbd-word').val("");
                        getNextSkip = true;
                        var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + wordIndex.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                        $('.cbd-instruction-' + activeStep).text(instruction);
                    }
                    var z = $('#cbd-z').val();
                    if (z.length > 0) {
                        z = Number(z);
                        z = (wordIndex % z == 0) ? z : wordIndex % z;
                        $('#cbd-word').attr({
                            'placeholder': z.ordinate() + ' Word'
                        });
                        activeWordIdex = z;
                        if (word.length == 0) {
                            var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + z.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                            $('.cbd-instruction-' + activeStep).text(instruction);
                        } else {
                            activeWordIdex = wordIndex;
                            $('#cbd-word').attr({
                                'placeholder': wordIndex.ordinate() + ' Word'
                            });
                            var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + wordIndex.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                            $('.cbd-instruction-' + activeStep).text(instruction);
                        }
                        if (word.length > 0) {
                            var exp = $('#cbd-expression').text();
                            exp += z + "@" + _nextPage + "\\";
                            exp += "+*:" + cbd['ps'] + " ";
                            cbd['ps'] = null ;
                            $('#cbd-expression').text(exp);
                            $('#cbd-z').val("");
                        }
                    } else if (words.length > 0) {
                        activeWordIdex = wordIndex;
                        $('#cbd-word').attr({
                            'placeholder': wordIndex.ordinate() + ' Word'
                        });
                        var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + wordIndex.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                        $('.cbd-instruction-' + activeStep).text(instruction);
                        if (word.length > 0) {
                            var exp = $('#cbd-expression').text();
                            exp += activeWordIdex + "@" + _nextPage + "\\";
                            exp += "+*:" + cbd['ps'] + " ";
                            cbd['ps'] = null ;
                            $('#cbd-expression').text(exp);
                            currentPage = _nextPage;
                        }
                    }
                    if (cbd['wc'] == words.length) {
                        activeStep += 1;
                        activateStep(activeStep);
                        var exp = $('#cbd-expression').text();
                        $('#cbd-expression').text("");
                        renderMessage(exp, words);
                    } else if (getNextSkip) {
                        getRandomDigits(4, 1, 99, function(nums) {
                            cbd['v-wi'] = nums[0];
                            cbd['h-wi'] = nums[1];
                            cbd['ps'] = nums[2];
                            // new skip
                            console.log(JSON.stringify(nums));
                            // update expression...
                            var exp = $('#cbd-expression').text();
                            exp += "@^!:" + cbd['v-wi'] + ", ";
                            $('#cbd-expression').text(exp);
                            // update
                            var exp = $('#cbd-expression').text();
                            exp += "@>!:" + cbd['h-wi'] + ", ";
                            $('#cbd-expression').text(exp);
                            var skip = cbd['ps'];
                            _nextPage = (currentPage + skip) % cbd['fp_y'] || cbd['fp_y'];
                            if ((cbd['d-fp'] % 2) != 0) {
                                _nextPage = (currentPage - skip) % cbd['fp_y'] || cbd['fp_y'];
                                ;_nextPage = _nextPage <= 0 ? cbd['fp_y'] + _nextPage : _nextPage;
                                // for proper modulo subtraction
                            }
                            var n = nums[3];
                            var exp = $('#cbd-expression').text();
                            exp += "@*:";
                            $('#cbd-expression').text(exp);
                            cbd['wi'] = n;
                            wordIndex = n;
                            $('#cbd-word').attr({
                                'placeholder': wordIndex.ordinate() + ' Word'
                            });
                            var instruction = "On the " + _nextPage.ordinate() + " page in the book, counting pages " + (cbd['d-fp'] % 2 == 0 ? "left to right" : "right to left") + ", refer to the " + wordIndex.ordinate() + " word (counting words on the page, " + (cbd['v-wi'] % 2 == 0 ? "top to bottom" : "bottom to top") + " and " + (cbd['h-wi'] % 2 == 0 ? "left to right" : "right to left") + ")";
                            $('.cbd-instruction-' + activeStep).text(instruction);
                        });
                    }
                }, [cbd['v-wi'], cbd['h-wi'], cbd['ps']]);
                break;
            }
        }
    });
    function renderMessage(exp, words) {
        $('#cbd-message').text(exp + " || " + words.join(" "));
    }
    Number.prototype.ordinate = function() {
        var num = this
          , numStr = num.toString()
          , last = numStr.slice(-1)
          , len = numStr.length
          , ord = '';
        switch (last) {
        case '1':
            ord = numStr.slice(-2) === '11' ? 'th' : 'st';
            break;
        case '2':
            ord = numStr.slice(-2) === '12' ? 'th' : 'nd';
            break;
        case '3':
            ord = numStr.slice(-2) === '13' ? 'th' : 'rd';
            break;
        default:
            ord = 'th';
            break;
        }
        return num.toString() + ord;
    }
    ;
});
