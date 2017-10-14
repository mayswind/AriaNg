if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  git config --global user.name "CircleCI";
  git config --global user.email "CircleCI";

  echo "Publishing daily build...";
  git clone https://github.com/mayswind/AriaNg-DailyBuild.git $CIRCLE_ARTIFACTS/AriaNg-DailyBuild/

  rm -rf $CIRCLE_ARTIFACTS/AriaNg-DailyBuild/*
  cp dist/* $CIRCLE_ARTIFACTS/AriaNg-DailyBuild/ -r;

  cd $CIRCLE_ARTIFACTS/AriaNg-DailyBuild/;

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin master;

  echo "Done.";
fi
