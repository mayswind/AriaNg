if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  echo "Packaging daily build...";
  cd dist;
  cp ../LICENSE ./;
  zip $CIRCLE_ARTIFACTS/dist.zip * -r -9;
  rm -f LICENSE;
  cd ..;

  echo "Publishing online demo...";
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
  rm -f downloads/latest_daily_build.zip;
  rm -f index.html;
  rm -f index.manifest;
  rm -f README.md;
  rm -f LICENSE;

  cp $CIRCLE_ARTIFACTS/dist/* ./ -r;
  mv $CIRCLE_ARTIFACTS/dist.zip ./downloads/latest_daily_build.zip;
  mv $CIRCLE_ARTIFACTS/README.md ./;
  mv $CIRCLE_ARTIFACTS/LICENSE ./;

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin gh-pages;

  echo "Done.   ";
fi
