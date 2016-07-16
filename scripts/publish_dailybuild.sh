if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  cp dist $CIRCLE_ARTIFACTS/ -r;
  git checkout -b gh-pages remotes/origin/gh-pages;
  rm -rf css;
  rm -rf fonts;
  rm -rf js;
  rm -rf langs;
  rm -rf imgs;
  rm -rf views;
  rm -f index.html;
  cp $CIRCLE_ARTIFACTS/dist/* ./ -r;
  git config --global user.name "CircleCI";
  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin gh-pages;
fi