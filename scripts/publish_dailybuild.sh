if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  cp dist $CIRCLE_ARTIFACTS/ -r;
  cp README.md $CIRCLE_ARTIFACTS/;
  cp LICENSE $CIRCLE_ARTIFACTS/;

  git config --global user.name "CircleCI";
  git config --global user.email "CircleCI";
  git checkout -b gh-pages remotes/origin/gh-pages;

  rm -rf css;
  rm -rf fonts;
  rm -rf js;
  rm -rf langs;
  rm -rf imgs;
  rm -rf views;
  rm -f index.html;
  rm -f README.md;
  rm -f LICENSE;

  cp $CIRCLE_ARTIFACTS/dist/* ./ -r;
  cp $CIRCLE_ARTIFACTS/README.md ./
  cp $CIRCLE_ARTIFACTS/LICENSE ./

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin gh-pages;

  zip $CIRCLE_ARTIFACTS/dist.zip $CIRCLE_ARTIFACTS/dist/* -r;
  rm -rf $CIRCLE_ARTIFACTS/dist;
  rm -f $CIRCLE_ARTIFACTS/README.md;
  rm -f $CIRCLE_ARTIFACTS/LICENSE;
fi